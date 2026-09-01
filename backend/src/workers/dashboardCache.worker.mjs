import { Worker } from 'bullmq';
import redisConnection from '../config/redis.mjs';
import TransactionModel from '../models/transaction.model.mjs';
import { sendErrorNotificationMail } from '../helpers/sender.mjs';

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
         throw error;
    }
}, { connection: redisConnection });

dashboardCacheWorker.on('failed', async (job, err) => {
    console.error(`Dashboard Cache job ${job.id} failed with error ${err.message}`);
    await sendErrorNotificationMail('Dashboard Cache Worker', job, err);
});

export default dashboardCacheWorker;
