import express from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getScreenerConfig, submitScreener } from '../services/screener.service.mjs';
import SurveyModel from '../models/survey.model.mjs';
import { getCountryFromIp, getCountryFromRequest, getClientIp } from '../helpers/ip.mjs';

const router = express.Router();

router.get('/config/:hash', asyncHandler(async (req, res) => {
    const { hash } = req.params;
    
    // Fetch survey to check IP filtering
    const survey = await SurveyModel.findOne({ 'vendorLinks.hash': hash, status: 'active' });
    if (!survey) {
        return res.status(404).json({ message: 'Survey not found or inactive' });
    }

    // IP Filtering Check
    if (survey.ipFiltering) {
        const geo = await getCountryFromRequest(req);
        const allowed = (survey.allowedCountries || []).map(c => c.trim().toUpperCase());
        const userCountryCode = (geo.countryCode || '').trim().toUpperCase();
        const userCountry = (geo.country || '').trim().toUpperCase();

        const isAllowed = allowed.includes(userCountryCode) || allowed.includes(userCountry);
        console.log(`[Screener IP Filter] Allowed: ${JSON.stringify(allowed)} | Detected: ${userCountryCode} (${userCountry}) | Match: ${isAllowed}`);

        // Match country code
        if (!isAllowed) {
            return res.json({
                status: 'rejected',
                message: 'Sorry, your region is not eligible for this survey.'
            });
        }
    }
    
    // Check if they have a token in cookies or Authorization header
    const cookieName = `screener_token_${hash}`;
    let token = req.cookies[cookieName];
    
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.hash === hash) {
                const config = await getScreenerConfig(hash);
                
                // Evaluate the stored answers against the current eligibility rules of this survey
                let isQualified = true;
                if (config) {
                    for (const [key, expectedValue] of Object.entries(config)) {
                        if (decoded.answers && decoded.answers[key] !== expectedValue) {
                            isQualified = false;
                            break;
                        }
                    }
                }
                
                if (!isQualified) {
                    return res.json({
                        status: 'rejected',
                        message: 'Sorry, you do not qualify for this survey.'
                    });
                } else if (decoded.status === 'qualified' && decoded.redirectUrl) {
                    // Forward qualified user back to survey since they qualified previously
                    return res.json({
                        status: 'qualified',
                        redirectUrl: decoded.redirectUrl
                    });
                } else if (decoded.status === 'screened_out') {
                    // If they were screened out and still do not qualify, reject them.
                    // If the config changed and they now qualify, we'll let them retry (skip this block)
                    return res.json({
                        status: 'rejected',
                        message: 'Sorry, you do not qualify for this survey.'
                    });
                }
            }
        } catch (error) {
            console.warn("Invalid or expired screener token:", error.message);
        }
    }

    try {
        const config = await getScreenerConfig(hash);
        res.json({ eligibilityRules: config || {} });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}));

router.post('/submit', asyncHandler(async (req, res) => {
    const { hash, vendor_rid, answers } = req.body;
    
    // Check if they already submitted successfully
    const cookieName = `screener_token_${hash}`;
    let token = req.cookies[cookieName];
    
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.hash === hash && decoded.status === 'qualified') {
                return res.status(400).json({ message: 'You have already submitted and qualified for this survey.' });
            }
        } catch (error) {
            // Ignore invalid token on submit and let them proceed
        }
    }

    // IP and session extracted from request
    const ipAddress = getClientIp(req);
    console.log('[Screener Submit] Extracted Client IP:', ipAddress);
    const sessionFingerprint = req.cookies?.sessionId || 'unknown';

    try {
        const result = await submitScreener({ hash, vendor_rid, answers, ipAddress, sessionFingerprint });
        
        // Create a JWT token for the screener result
        const screenerToken = jwt.sign(
            { 
                hash, 
                vendor_rid, 
                answers, 
                status: result.status, 
                redirectUrl: result.redirectUrl || null 
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Set token cookie
        res.cookie(cookieName, screenerToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.COOKIE_SAME_SITE || 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            ...result,
            token: screenerToken
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}));

export default router;
