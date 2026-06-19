import SurveyModel from "../models/survey.mjs";
import connectDB from "../config/db.mjs";


export async function getSurveyCount(req, res) {
    try {
        connectDB();
        const total_entries = await SurveyModel.countDocuments();
        const complete_entries = await SurveyModel.countDocuments({ status: "Complete" });
        const terminate_entries = await SurveyModel.countDocuments({ status: "Terminate" });
        const quota_full_entries = await SurveyModel.countDocuments({ status: "Quota Full" });
        const security_term_entries = await SurveyModel.countDocuments({ status: "Security Term" });
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
        connectDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const surveys = await SurveyModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getCompletedSurveys(req, res) {
    try {
        connectDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const surveys = await SurveyModel.find({ status: "Complete" }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getTerminatedSurveys(req, res) {
    try {
        connectDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const surveys = await SurveyModel.find({ status: "Terminate" }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getQuotaFullSurveys(req, res) {
    try {
        connectDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const surveys = await SurveyModel.find({ status: "Quota Full" }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getSecurityTermSurveys(req, res) {
    try {
        connectDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const surveys = await SurveyModel.find({ status: "Security Term" }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json(surveys);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function removeSurvey(req, res) {
    try {
        connectDB();
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
        connectDB();
        const { id } = req.params;
        const { status } = req.body;
        if(!id || !status){
            return res.status(400).json({ message: "Survey ID and status are required" });
        }
        const survey = await SurveyModel.findByIdAndUpdate(id, { status }, { new: true });
        if(!survey){
            return res.status(404).json({ message: "Survey not found" });
        }
        return res.status(200).json(survey);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}