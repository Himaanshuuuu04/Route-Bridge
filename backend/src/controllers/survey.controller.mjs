import TransactionModel from "../models/transaction.model.mjs";
import agenda from "../config/agenda.mjs";
import { getCountryFromIp } from "../helpers/ip.mjs";
import { renderSurveyTemplate } from "../helpers/template.mjs";

async function processLegacyBridge(status, req, res) {
    try {
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).send("Bad Request: uid and pid are required");
        }
        
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '';
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        const geo = await getCountryFromIp(ip);

        // Bridge Action (Merged)
        let mappedStatus = 'completed';
        if (status === 'Quota Full') mappedStatus = 'quota_full';
        if (status === 'Terminate') mappedStatus = 'terminate';
        if (status === 'Security Term') mappedStatus = 'security_term';

        let transaction = await TransactionModel.findOne({ transactionToken: uid });

        if (transaction) {
            const isUpdatable = transaction.status === 'started';
            const isIpMatch = transaction.ipAddress === ip;

            if (isUpdatable && isIpMatch) {
                transaction = await TransactionModel.findOneAndUpdate(
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

                if (transaction) {
                    // Fire propagate-webhook
                    await agenda.now('propagate-webhook', { transactionId: transaction._id });
                }
            }
        }

        const transactionCreatedAt = transaction ? transaction.createdAt : new Date();
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
