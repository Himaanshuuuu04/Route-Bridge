import { Worker } from 'bullmq';
import axios from 'axios';
import redisConnection from '../config/redis.mjs';
import TransactionModel from '../models/transaction.model.mjs';
import { sendErrorNotificationMail } from '../helpers/sender.mjs';

const webhookWorker = new Worker('webhookQueue', async (job) => {
    const { transactionId } = job.data;

    try {
        const transaction = await TransactionModel.findById(transactionId).populate('vendorId');
        
        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        const vendor = transaction.vendorId;
        if (!vendor) {
            console.log(`No vendor found for transaction ${transactionId}`);
            return;
        }

        let targetUrl = '';
        switch (transaction.status) {
            case 'completed':
                targetUrl = vendor.completeUrl;
                break;
            case 'screened_out':
            case 'terminate':
                targetUrl = vendor.terminateUrl;
                break;
            case 'quota_full':
                targetUrl = vendor.quotaFullUrl;
                break;
            case 'security_term':
            case 'fraud':
                targetUrl = vendor.securityTermUrl;
                break;
            default:
                break;
        }

        if (!targetUrl) {
            console.log(`No suitable callback URL configured for status '${transaction.status}' on vendor ${vendor.name}`);
            return;
        }

        let postbackUrl = targetUrl.replace('{{vendor_rid}}', transaction.vendorRid || '');

        console.log(`Firing webhook to vendor ${vendor.name} for status ${transaction.status}: ${postbackUrl}`);
        await axios.get(postbackUrl);
        console.log(`Successfully fired webhook for transaction ${transactionId}`);
    } catch (error) {
        console.error(`Failed to propagate webhook for transaction ${transactionId}:`, error.message);
        throw error;
    }
}, { connection: redisConnection });

webhookWorker.on('failed', async (job, err) => {
    console.error(`Webhook job ${job.id} failed with error ${err.message}`);
    await sendErrorNotificationMail('Webhook Worker', job, err);
});

export default webhookWorker;
