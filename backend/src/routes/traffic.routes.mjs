import express from 'express';
import asyncHandler from 'express-async-handler';
import { handleTrafficRouting } from '../services/traffic.service.mjs';

const router = express.Router();

router.get('/:hash', asyncHandler(async (req, res) => {
    const { hash } = req.params;
    const { vendor_rid } = req.query;

    try {
        const redirectUrl = await handleTrafficRouting(hash, vendor_rid);
        res.redirect(302, redirectUrl);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}));

export default router;
