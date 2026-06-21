import SurveyModel from "../models/survey.mjs";

function buildDateFilter(req) {
    const filter = {};
    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
            const start = new Date(req.query.startDate);
            if (!isNaN(start.getTime())) {
                start.setUTCHours(0, 0, 0, 0);
                filter.createdAt.$gte = start;
            }
        }
        if (req.query.endDate) {
            const end = new Date(req.query.endDate);
            if (!isNaN(end.getTime())) {
                end.setUTCHours(23, 59, 59, 999);
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
        const total_entries = await SurveyModel.countDocuments(filter);
        const complete_entries = await SurveyModel.countDocuments({ ...filter, status: "Complete" });
        const terminate_entries = await SurveyModel.countDocuments({ ...filter, status: "Terminate" });
        const quota_full_entries = await SurveyModel.countDocuments({ ...filter, status: "Quota Full" });
        const security_term_entries = await SurveyModel.countDocuments({ ...filter, status: "Security Term" });
        return res.status(200).json({
            total_entries,
            complete_entries,
            terminate_entries,
            quota_full_entries,
            security_term_entries
        });
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
        const surveys = await SurveyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getCompletedSurveys(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const filter = { ...buildDateFilter(req), status: "Complete" };
        const surveys = await SurveyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getTerminatedSurveys(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const filter = { ...buildDateFilter(req), status: "Terminate" };
        const surveys = await SurveyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getQuotaFullSurveys(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const filter = { ...buildDateFilter(req), status: "Quota Full" };
        const surveys = await SurveyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getSecurityTermSurveys(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const filter = { ...buildDateFilter(req), status: "Security Term" };
        const surveys = await SurveyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function removeSurvey(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Survey ID is required" });
        }
        const survey = await SurveyModel.findByIdAndDelete(id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }
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
        const survey = await SurveyModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }
        return res.status(200).json(survey);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}