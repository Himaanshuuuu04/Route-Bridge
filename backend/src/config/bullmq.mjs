import { Queue, Worker } from 'bullmq';
import axios from 'axios';
import redisConnection from './redis.mjs';
import TransactionModel from '../models/transaction.model.mjs';

// --- Queues ---
export const webhookQueue = new Queue('webhookQueue', { connection: redisConnection });
export const dashboardCacheQueue = new Queue('dashboardCacheQueue', { connection: redisConnection });

// --- Webhook Worker ---
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

// --- Dashboard Cache Worker ---
const dashboardCacheWorker = new Worker('dashboardCacheQueue', async (job) => {
    try {
        console.log("Rebuilding default dashboard cache...");
        const filter = {}; 
        const total_entries = await TransactionModel.countDocuments(filter);
        const complete_entries = await TransactionModel.countDocuments({ ...filter, status: "completed" });
        const terminate_entries = await TransactionModel.countDocuments({ ...filter, status: "terminate" });
        const quota_full_entries = await TransactionModel.countDocuments({ ...filter, status: "quota_full" });
        const security_term_entries = await TransactionModel.countDocuments({ ...filter, status: "security_term" });
        const started_entries = await TransactionModel.countDocuments({ ...filter, status: "started" });
        const screened_out_entries = await TransactionModel.countDocuments({ ...filter, status: "screened_out" });
        const fraud_entries = await TransactionModel.countDocuments({ ...filter, status: "fraud" });

        const timelineData = await TransactionModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    statuses: {
                        $push: {
                            status: "$_id.status",
                            count: "$count"
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const timeline = timelineData.map(item => {
            const formatted = {
                date: item._id,
                started: 0,
                completed: 0,
                screened_out: 0,
                quota_full: 0,
                fraud: 0,
                terminate: 0,
                security_term: 0
            };
            item.statuses.forEach(s => {
                if (s.status in formatted) {
                    formatted[s.status] = s.count;
                }
            });
            return formatted;
        });

        const dashboardData = {
            total_entries,
            complete_entries,
            terminate_entries,
            quota_full_entries,
            security_term_entries,
            started_entries,
            screened_out_entries,
            fraud_entries,
            timeline
        };

        await redisConnection.set('dashboard:stats:default', JSON.stringify(dashboardData));
        console.log("Successfully rebuilt dashboard cache.");
    } catch (error) {
         console.error("Failed to rebuild dashboard cache", error);
    }
}, { connection: redisConnection });

webhookWorker.on('failed', (job, err) => {
    console.error(`Webhook job ${job.id} failed with error ${err.message}`);
});
dashboardCacheWorker.on('failed', (job, err) => {
    console.error(`Dashboard Cache job ${job.id} failed with error ${err.message}`);
});
