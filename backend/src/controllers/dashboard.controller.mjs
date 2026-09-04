import TransactionModel from "../models/transaction.model.mjs";
import redisConnection from "../config/redis.mjs";
import { dashboardCacheQueue } from "../config/bullmq.mjs";

function buildDateFilter(req) {
    const filter = {};
    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
            const start = new Date(req.query.startDate);
            if (!isNaN(start.getTime())) {
                if (typeof req.query.startDate === 'string' && !req.query.startDate.includes('T')) {
                    start.setUTCHours(0, 0, 0, 0);
                }
                filter.createdAt.$gte = start;
            }
        }
        if (req.query.endDate) {
            const end = new Date(req.query.endDate);
            if (!isNaN(end.getTime())) {
                if (typeof req.query.endDate === 'string' && !req.query.endDate.includes('T')) {
                    end.setUTCHours(23, 59, 59, 999);
                }
                filter.createdAt.$lte = end;
            }
        }
        if (Object.keys(filter.createdAt).length === 0) {
            delete filter.createdAt;
        }
    }
    return filter;
}

export async function getSurveyCount(req, res) {
    try {
        const filter = buildDateFilter(req);
        const uidQuery = req.query.uid ? req.query.uid.trim() : '';
        const pidQuery = req.query.pid ? req.query.pid.trim() : '';
        
        if (uidQuery) {
            filter.$or = [
                { transactionToken: { $regex: uidQuery, $options: 'i' } },
                { vendorRid: { $regex: uidQuery, $options: 'i' } },
                { uid: { $regex: uidQuery, $options: 'i' } }
            ];
        }

        if (pidQuery) {
            filter.projectId = { $regex: pidQuery, $options: 'i' };
        }

        const isDefault = Object.keys(filter).length === 0 && !uidQuery && !pidQuery;

        // Try reading from cache if no custom date filters are applied
        if (isDefault) {
            const cachedData = await redisConnection.get('dashboard:stats:default');
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }
        }

        // Parallelize MongoDB count and aggregate queries
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

        // Trigger queue worker to rebuild and refresh the cache in the background
        if (isDefault) {
            await dashboardCacheQueue.add('rebuild', {}, { jobId: 'dashboard-rebuild-job', removeOnComplete: true });
        }

        return res.status(200).json(dashboardData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getRecentSurveys(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const filter = buildDateFilter(req);
        const statusQuery = req.query.status || 'All';
        const uidQuery = req.query.uid ? req.query.uid.trim() : '';
        const pidQuery = req.query.pid ? req.query.pid.trim() : '';
        const isDefault = Object.keys(filter).length === 0 && page === 1 && statusQuery === 'All' && !uidQuery && !pidQuery;

        const cacheKey = `dashboard:recent:${page}:${limit}:${statusQuery}:${req.query.startDate || ''}:${req.query.endDate || ''}:${uidQuery}:${pidQuery}`;
        
        // Try reading from cache first
        const cachedData = await redisConnection.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Trigger queue worker to rebuild and refresh the cache in the background on cache miss
        if (isDefault) {
            await dashboardCacheQueue.add('rebuild', {}, { jobId: 'dashboard-rebuild-job', removeOnComplete: true });
        }

        if (req.query.status && req.query.status !== 'All') {
            let statusVal = req.query.status;
            if (statusVal === 'Complete' || statusVal === 'completed') statusVal = 'completed';
            else if (statusVal === 'Terminate' || statusVal === 'terminate') statusVal = 'terminate';
            else if (statusVal === 'Quota Full' || statusVal === 'quota_full') statusVal = 'quota_full';
            else if (statusVal === 'Security Term' || statusVal === 'security_term') statusVal = 'security_term';
            else if (statusVal === 'Screen Out' || statusVal === 'screened_out') statusVal = 'screened_out';
            filter.status = statusVal;
        }

        if (uidQuery) {
            filter.$or = [
                { transactionToken: { $regex: uidQuery, $options: 'i' } },
                { vendorRid: { $regex: uidQuery, $options: 'i' } },
                { uid: { $regex: uidQuery, $options: 'i' } }
            ];
        }

        if (pidQuery) {
            filter.projectId = { $regex: pidQuery, $options: 'i' };
        }

        const surveys = await TransactionModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('vendorId', 'name')
            .populate({
                path: 'surveyId',
                select: 'supplierId name projectId',
                populate: { path: 'supplierId', select: 'name' }
            })
            .lean();

        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function invalidateDashboardCache() {
    try {
        const keys = await redisConnection.keys('dashboard:*');
        if (keys.length > 0) {
            await redisConnection.del(...keys);
        }
    } catch (err) {
        console.error('Error clearing dashboard cache:', err);
    }
}

export async function removeSurvey(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Survey ID is required" });
        }
        const survey = await TransactionModel.findByIdAndDelete(id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        await invalidateDashboardCache();
        await dashboardCacheQueue.add('rebuild', {}, { jobId: 'dashboard-rebuild-job', removeOnComplete: true });

        return res.status(200).json(survey);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateSurvey(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ message: "Survey ID and status are required" });
        }
        const survey = await TransactionModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        await invalidateDashboardCache();
        await dashboardCacheQueue.add('rebuild', {}, { jobId: 'dashboard-rebuild-job', removeOnComplete: true });

        return res.status(200).json(survey);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function downloadSurveysCSV(req, res) {
    try {
        const filter = buildDateFilter(req);
        
        if (req.query.status && req.query.status !== 'All') {
            let statusVal = req.query.status;
            if (statusVal === 'Complete' || statusVal === 'completed') statusVal = 'completed';
            else if (statusVal === 'Terminate' || statusVal === 'terminate') statusVal = 'terminate';
            else if (statusVal === 'Quota Full' || statusVal === 'quota_full') statusVal = 'quota_full';
            else if (statusVal === 'Security Term' || statusVal === 'security_term') statusVal = 'security_term';
            else if (statusVal === 'Screen Out' || statusVal === 'screened_out') statusVal = 'screened_out';
            filter.status = statusVal;
        }
        
        if (req.query.uid) {
            const uidTrimmed = req.query.uid.trim();
            req.query.uid = uidTrimmed;
            filter.$or = [
                { transactionToken: { $regex: req.query.uid, $options: 'i' } },
                { vendorRid: { $regex: req.query.uid, $options: 'i' } },
                { uid: { $regex: req.query.uid, $options: 'i' } }
            ];
        }

        if (req.query.pid) {
            const pidTrimmed = req.query.pid.trim();
            req.query.pid = pidTrimmed;
            filter.projectId = { $regex: req.query.pid, $options: 'i' };
        }

        const surveys = await TransactionModel.find(filter)
            .sort({ createdAt: -1 })
            .populate('vendorId', 'name')
            .populate({
                path: 'surveyId',
                select: 'supplierId name projectId',
                populate: { path: 'supplierId', select: 'name' }
            });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="surveys_data.csv"');

        const headers = ['Transaction Token', 'Project ID', 'Serial', 'Survey Name', 'Vendor Name', 'Vendor RID', 'IP Address', 'Country', 'Status', 'Started At', 'Completed At'];
        res.write(headers.join(',') + '\n');

        surveys.forEach(survey => {
            const row = [
                `"${survey.transactionToken || survey.uid || ''}"`,
                `"${survey.projectId || survey.pid || ''}"`,
                `"${survey.serial !== undefined && survey.serial !== null ? survey.serial : ''}"`,
                `"${survey.surveyId?.name || ''}"`,
                `"${survey.vendorId?.name || ''}"`,
                `"${survey.vendorRid || ''}"`,
                `"${survey.ipAddress || ''}"`,
                `"${survey.country || ''}"`,
                `"${survey.status || ''}"`,
                `"${survey.startedAt ? new Date(survey.startedAt).toISOString() : ''}"`,
                `"${survey.completedAt ? new Date(survey.completedAt).toISOString() : ''}"`
            ];
            res.write(row.join(',') + '\n');
        });

        res.end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
