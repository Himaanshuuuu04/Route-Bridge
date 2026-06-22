import TransactionModel from "../models/transaction.model.mjs";
import agenda from "../config/agenda.mjs";
import { getCountryFromIp } from "../helpers/ip.mjs";

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

        const transaction = await TransactionModel.findOneAndUpdate(
            { transactionToken: uid },
            {
                status: mappedStatus,
                ipAddress: ip,
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

        // Return exact response requested in prompt to maintain legacy contract
        return res.status(200).json({ message: "Survey updated successfully" });
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
