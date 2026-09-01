import { Worker } from 'bullmq';
import redisConnection from '../config/redis.mjs';
import TransactionModel from '../models/transaction.model.mjs';
import { sendErrorNotificationMail } from '../helpers/sender.mjs';

const dashboardCacheWorker = new Worker('dashboardCacheQueue', async (job) => {
    try {
        console.log("Rebuilding default dashboard cache...");
        const filter = {}; 
        const [
            total_entries,
            complete_entries,
            terminate_entries,
            quota_full_entries,
            security_term_entries,
            started_entries,
            screened_out_entries,
            fraud_entries,
            timelineData
        ] = await Promise.all([
            TransactionModel.countDocuments(filter),
            TransactionModel.countDocuments({ ...filter, status: "completed" }),
            TransactionModel.countDocuments({ ...filter, status: "terminate" }),
            TransactionModel.countDocuments({ ...filter, status: "quota_full" }),
            TransactionModel.countDocuments({ ...filter, status: "security_term" }),
            TransactionModel.countDocuments({ ...filter, status: "started" }),
            TransactionModel.countDocuments({ ...filter, status: "screened_out" }),
            TransactionModel.countDocuments({ ...filter, status: "fraud" }),
            TransactionModel.aggregate([
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
            ])
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

        // 1. Update stats cache
        await redisConnection.set('dashboard:stats:default', JSON.stringify(dashboardData), 'EX', 300);

        // 2. Clear old recent surveys cache keys
        const recentKeys = await redisConnection.keys('dashboard:recent:*');
        if (recentKeys.length > 0) {
            await redisConnection.del(...recentKeys);
        }

        // 3. Pre-warm default recent surveys caches (page 1, limit 10 & 50)
        const recentSurveys10 = await TransactionModel.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('vendorId', 'name')
            .populate({
                path: 'surveyId',
                select: 'supplierId name projectId',
                populate: { path: 'supplierId', select: 'name' }
            })
            .lean();

        await redisConnection.set('dashboard:recent:1:10:All::', JSON.stringify(recentSurveys10), 'EX', 120);

        const recentSurveys50 = await TransactionModel.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('vendorId', 'name')
            .populate({
                path: 'surveyId',
                select: 'supplierId name projectId',
                populate: { path: 'supplierId', select: 'name' }
            })
            .lean();

        await redisConnection.set('dashboard:recent:1:50:All::', JSON.stringify(recentSurveys50), 'EX', 120);

        console.log("Successfully rebuilt dashboard stats and recent surveys cache.");
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
