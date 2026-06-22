import express from 'express';
import { processSupplierWebhook } from '../services/webhook.service.mjs';

const router = express.Router();

router.post('/supplier/:supplierId', (req, res) => {
    // Rule 1: MUST respond immediately with 200 OK
    res.status(200).send('OK');

    // Process asynchronously
    const { supplierId } = req.params;
    const payload = req.body;

    processSupplierWebhook(supplierId, payload).catch(err => {
        console.error('Error processing supplier webhook:', err.message);
    });
});

export default router;
