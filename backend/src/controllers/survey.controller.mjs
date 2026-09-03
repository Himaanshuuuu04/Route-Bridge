import TransactionModel from "../models/transaction.model.mjs";
import SurveyModel from "../models/survey.model.mjs";
import { webhookQueue, dashboardCacheQueue } from "../config/bullmq.mjs";
import { getCountryFromIp, getCountryFromRequest, getClientIp } from "../helpers/ip.mjs";
import { renderSurveyTemplate } from "../helpers/template.mjs";

async function handleRegisteredProject(uid, pid, ip, geo, mappedStatus, transaction) {
    // Rule: Exists? No -> Ignore
    if (!transaction) {
        return null;
    }

    // Rule: Status==started? No -> Ignore
    if (transaction.status !== 'started') {
        return transaction;
    }

    // Rule: Status==started? Yes -> perform IP validation
    if (transaction.ipAddress !== ip) {
        // IP doesn't match -> ignore
        return transaction;
    }

    // Rule: Update transaction, update projectId, update country, schedule webhook
    const updatedTransaction = await TransactionModel.findOneAndUpdate(
        { transactionToken: uid },
        {
            status: mappedStatus,
            country: geo.country,
            countryCode: geo.countryCode,
            projectId: pid,
            ...(mappedStatus === 'completed' && { completedAt: new Date() })
        },
        { new: true }
    );

    if (updatedTransaction) {
        await webhookQueue.add('fire', { transactionId: updatedTransaction._id });
        await dashboardCacheQueue.add('rebuild', {}, { jobId: 'dashboard-rebuild-job', removeOnComplete: true });
    }

    return updatedTransaction;
}

async function handleUnregisteredProject(uid, pid, ip, geo, mappedStatus, transaction) {
    // Rule: Exists? Yes -> Ignore
    if (transaction) {
        return transaction;
    }

    // Rule: Exists? No -> Accept (Create new transaction)
    const newTransaction = new TransactionModel({
        transactionToken: uid,
        projectId: pid,
        ipAddress: ip,
        country: geo.country,
        countryCode: geo.countryCode,
        status: mappedStatus,
        ...(mappedStatus === 'completed' && { completedAt: new Date() })
    });
    
    await newTransaction.save();
    await dashboardCacheQueue.add('rebuild', {}, { jobId: 'dashboard-rebuild-job', removeOnComplete: true });
    return newTransaction;
}

async function processLegacyBridge(status, req, res) {
    try {
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).send("Bad Request: uid and pid are required");
        }
        
        const ip = getClientIp(req);
        const geo = await getCountryFromRequest(req);

        // Bridge Action (Merged)
        let mappedStatus = 'completed';
        if (status === 'Quota Full') mappedStatus = 'quota_full';
        if (status === 'Terminate') mappedStatus = 'terminate';
        if (status === 'Security Term') mappedStatus = 'security_term';

        // Find existing user/txn
        let transaction = await TransactionModel.findOne({ transactionToken: uid });
        
        // Is project registered?
        const survey = await SurveyModel.findOne({ projectId: pid });
        const isRegistered = !!survey;

        let finalTransaction;
        if (isRegistered) {
            finalTransaction = await handleRegisteredProject(uid, pid, ip, geo, mappedStatus, transaction);
        } else {
            finalTransaction = await handleUnregisteredProject(uid, pid, ip, geo, mappedStatus, transaction);
        }

        const referenceTransaction = finalTransaction || transaction;
        const transactionCreatedAt = referenceTransaction ? referenceTransaction.createdAt : new Date();
        const html = renderSurveyTemplate(status, pid, uid, ip, transactionCreatedAt);
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
    } catch (error) {
        console.error("Legacy bridge error:", error);
        res.status(500).send("Internal Server Error");
    }
}

export async function completeSurvey(req, res) {
    return processLegacyBridge('Complete', req, res);
}

export async function terminateSurvey(req, res) {
    return processLegacyBridge('Terminate', req, res);
}

export async function quotafullSurvey(req, res) {
    return processLegacyBridge('Quota Full', req, res);
}

export async function securitytermSurvey(req, res) {
    return processLegacyBridge('Security Term', req, res);
}
