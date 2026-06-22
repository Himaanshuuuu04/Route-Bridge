import express from 'express';
import asyncHandler from 'express-async-handler';
import { getScreenerConfig, submitScreener } from '../services/screener.service.mjs';

const router = express.Router();

router.get('/config/:hash', asyncHandler(async (req, res) => {
    const { hash } = req.params;
    try {
        const config = await getScreenerConfig(hash);
        res.json({ eligibilityRules: config || {} });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}));

router.post('/submit', asyncHandler(async (req, res) => {
    const { hash, vendor_rid, answers } = req.body;
    
    // IP and session could be pulled from req
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const sessionFingerprint = req.cookies?.sessionId || 'unknown';

    try {
        const result = await submitScreener({ hash, vendor_rid, answers, ipAddress, sessionFingerprint });
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}));

export default router;
