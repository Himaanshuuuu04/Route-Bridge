import SurveyModel from "../models/survey.mjs";
import connectDB from "../config/db.mjs";

export async function completeSurvey(req, res) {
    try {
        console.log(req);
        connectDB();
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).json({ message: "Bad Request" });
        }
        // const ipAddress = req.query.ipAddress;
        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: req.ip,
            status: "Complete"
        });
        if (!survey) {
            console.error("Unable to register the survey");
        }
        return res.status(200).json({ message: "Survey updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function terminateSurvey(req, res) {
    try {
        console.log(req);
        connectDB();
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).json({ message: "Bad Request" });
        }
        // const ipAddress = req.query.ipAddress;
        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: req.ip,
            status: "Terminate"
        });
        if (!survey) {
            console.error("Unable to register the survey");
        }
        return res.status(200).json({ message: "Survey updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function quotafullSurvey(req, res) {
    try {
        console.log(req);
        connectDB();
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).json({ message: "Bad Request" });
        }
        // const ipAddress = req.query.ipAddress;
        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: req.ip,
            status: "Quota Full"
        });
        if (!survey) {
            console.error("Unable to register the survey");
        }
        return res.status(200).json({ message: "Survey updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function securitytermSurvey(req, res) {
    try {
        console.log(req);
        connectDB();
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).json({ message: "Bad Request" });
        }
        // const ipAddress = req.query.ipAddress;
        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: req.ip,
            status: "Security Term"
        });

        if (!survey) {
            console.error("Unable to register the survey");
        }
        return res.status(200).json({ message: "Survey updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


