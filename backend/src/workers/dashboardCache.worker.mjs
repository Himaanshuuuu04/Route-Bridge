import { Worker } from 'bullmq';
import redisConnection from '../config/redis.mjs';
import TransactionModel from '../models/transaction.model.mjs';
import { sendErrorNotificationMail } from '../helpers/sender.mjs';

const STATS_CACHE_KEY = 'dashboard:stats:default';
const STATUSES = ['All', 'completed', 'terminate', 'quota_full', 'security_term', 'screened_out', 'started', 'fraud'];

async function rebuildCache() {
    console.log("Rebuilding default dashboard cache (all categories)...");
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

    // 1. Update stats cache (3600s TTL, refreshed on updates or cron)
    await redisConnection.set(STATS_CACHE_KEY, JSON.stringify(dashboardData), 'EX', 3600);

    // 2. Clear old recent list keys
    const recentKeys = await redisConnection.keys('dashboard:recent_list:*');
    if (recentKeys.length > 0) {
        await redisConnection.del(...recentKeys);
    }
    await redisConnection.del('dashboard:recent_list'); // Legacy key

    // 3. Clear user profile cache keys
    const userKeys = await redisConnection.keys('user:profile:*');
    if (userKeys.length > 0) {
        await redisConnection.del(...userKeys);
    }

    // 4. Pre-warm default recent surveys caches for ALL categories
    for (const st of STATUSES) {
        const queryFilter = st === 'All' ? {} : { status: st };
        const recentSurveys50 = await TransactionModel.find(queryFilter)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('vendorId', 'name')
            .populate({
                path: 'surveyId',
                select: 'supplierId name projectId',
                populate: { path: 'supplierId', select: 'name' }
            })
            .lean();
        
        const listKey = `dashboard:recent_list:${st}`;
        if (recentSurveys50.length > 0) {
            const stringifiedSurveys = recentSurveys50.map(s => JSON.stringify(s));
            await redisConnection.rpush(listKey, ...stringifiedSurveys);
            await redisConnection.expire(listKey, 3600);
        }
    }

    console.log("Successfully rebuilt dashboard stats and category queues.");
}

async function addEntry(transaction) {
    const rawStats = await redisConnection.get(STATS_CACHE_KEY);
    if (!rawStats) {
        return rebuildCache();
    }
    
    let stats = JSON.parse(rawStats);
    stats.total_entries = (stats.total_entries || 0) + 1;
    
    let statusKey = transaction.status + "_entries";
    if (transaction.status === "completed") statusKey = "complete_entries";

    if (stats[statusKey] !== undefined) {
        stats[statusKey] += 1;
    }

    // Update timeline
    const today = new Date().toISOString().split('T')[0];
    let todayTimeline = stats.timeline.find(t => t.date === today);
    if (!todayTimeline) {
        todayTimeline = { date: today, started: 0, completed: 0, screened_out: 0, quota_full: 0, fraud: 0, terminate: 0, security_term: 0 };
        stats.timeline.push(todayTimeline);
    }
    if (todayTimeline[transaction.status] !== undefined) {
        todayTimeline[transaction.status] += 1;
    }

    await redisConnection.set(STATS_CACHE_KEY, JSON.stringify(stats), 'EX', 3600);

    // Populate transaction for list if not populated
    let populatedTx = transaction;
    if (!transaction.vendorId?.name || !transaction.surveyId?.projectId) {
        populatedTx = await TransactionModel.findById(transaction._id)
            .populate('vendorId', 'name')
            .populate({
                path: 'surveyId',
                select: 'supplierId name projectId',
                populate: { path: 'supplierId', select: 'name' }
            })
            .lean();
    }
    
    if (populatedTx) {
        const jsonTx = JSON.stringify(populatedTx);
        
        // 1. Add to 'All' category
        await redisConnection.lpush(`dashboard:recent_list:All`, jsonTx);
        await redisConnection.ltrim(`dashboard:recent_list:All`, 0, 49);
        
        // 2. Add to specific status category
        if (populatedTx.status) {
            const listKey = `dashboard:recent_list:${populatedTx.status}`;
            await redisConnection.lpush(listKey, jsonTx);
            await redisConnection.ltrim(listKey, 0, 49);
        }
    }
}

async function updateEntry(transaction, oldStatus) {
    const rawStats = await redisConnection.get(STATS_CACHE_KEY);
    if (!rawStats) {
        return rebuildCache();
    }

    let stats = JSON.parse(rawStats);
    
    // Decrement old
    if (oldStatus) {
        let oldStatusKey = oldStatus + "_entries";
        if (oldStatus === "completed") oldStatusKey = "complete_entries";
        if (stats[oldStatusKey] !== undefined && stats[oldStatusKey] > 0) {
            stats[oldStatusKey] -= 1;
        }

        const dateKey = transaction.createdAt ? new Date(transaction.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        let dateTimeline = stats.timeline.find(t => t.date === dateKey);
        if (dateTimeline && dateTimeline[oldStatus] !== undefined && dateTimeline[oldStatus] > 0) {
            dateTimeline[oldStatus] -= 1;
        }
    }

    // Increment new
    let newStatusKey = transaction.status + "_entries";
    if (transaction.status === "completed") newStatusKey = "complete_entries";
    if (stats[newStatusKey] !== undefined) {
        stats[newStatusKey] += 1;
    }

    const dateKey = transaction.createdAt ? new Date(transaction.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    let dateTimeline = stats.timeline.find(t => t.date === dateKey);
    if (!dateTimeline) {
        dateTimeline = { date: dateKey, started: 0, completed: 0, screened_out: 0, quota_full: 0, fraud: 0, terminate: 0, security_term: 0 };
        stats.timeline.push(dateTimeline);
    }
    if (dateTimeline[transaction.status] !== undefined) {
        dateTimeline[transaction.status] += 1;
    }

    await redisConnection.set(STATS_CACHE_KEY, JSON.stringify(stats), 'EX', 3600);

    // Populate tx
    let populatedTx = await TransactionModel.findById(transaction._id)
        .populate('vendorId', 'name')
        .populate({
            path: 'surveyId',
            select: 'supplierId name projectId',
            populate: { path: 'supplierId', select: 'name' }
        })
        .lean();

    if (populatedTx) {
        const jsonTx = JSON.stringify(populatedTx);

        // 1. Inline update in 'All' list
        let allListItems = await redisConnection.lrange(`dashboard:recent_list:All`, 0, -1);
        let allItemIndex = allListItems.findIndex(item => {
            try { return JSON.parse(item)._id === transaction._id.toString(); } catch { return false; }
        });
        if (allItemIndex !== -1) {
            await redisConnection.lset(`dashboard:recent_list:All`, allItemIndex, jsonTx);
        }

        // 2. Remove from old category list (if status changed)
        if (oldStatus && oldStatus !== transaction.status) {
            let oldListItems = await redisConnection.lrange(`dashboard:recent_list:${oldStatus}`, 0, -1);
            let oldItemIndex = oldListItems.findIndex(item => {
                try { return JSON.parse(item)._id === transaction._id.toString(); } catch { return false; }
            });
            if (oldItemIndex !== -1) {
                // Rewrite list without the item
                oldListItems.splice(oldItemIndex, 1);
                await redisConnection.del(`dashboard:recent_list:${oldStatus}`);
                if (oldListItems.length > 0) {
                    await redisConnection.rpush(`dashboard:recent_list:${oldStatus}`, ...oldListItems);
                }
            }
            
            // 3. Add to new category list
            const newStatus = transaction.status;
            if (newStatus) {
                await redisConnection.lpush(`dashboard:recent_list:${newStatus}`, jsonTx);
                await redisConnection.ltrim(`dashboard:recent_list:${newStatus}`, 0, 49);
            }
        } else {
            // Inline update in same category list
            const currentStatus = transaction.status;
            if (currentStatus) {
                let statusListItems = await redisConnection.lrange(`dashboard:recent_list:${currentStatus}`, 0, -1);
                let statusItemIndex = statusListItems.findIndex(item => {
                    try { return JSON.parse(item)._id === transaction._id.toString(); } catch { return false; }
                });
                if (statusItemIndex !== -1) {
                    await redisConnection.lset(`dashboard:recent_list:${currentStatus}`, statusItemIndex, jsonTx);
                }
            }
        }
    }
}

const dashboardCacheWorker = new Worker('dashboardCacheQueue', async (job) => {
    try {
        if (job.name === 'add_entry') {
            await addEntry(job.data.transaction);
        } else if (job.name === 'update_entry') {
            await updateEntry(job.data.transaction, job.data.oldStatus);
        } else {
            // default to rebuild
            await rebuildCache();
        }
    } catch (error) {
         console.error(`Failed to process dashboard cache job: ${job.name}`, error);
         throw error;
    }
}, { connection: redisConnection });

dashboardCacheWorker.on('failed', async (job, err) => {
    console.error(`Dashboard Cache job ${job.id} failed with error ${err.message}`);
    await sendErrorNotificationMail('Dashboard Cache Worker', job, err);
});

export default dashboardCacheWorker;
