import SurveyModel from "../models/survey.mjs";
import { getCountryFromIp } from "../helpers/ip.mjs";
import { renderSurveyTemplate } from "../helpers/template.mjs";

export async function completeSurvey(req, res) {
    try {
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).send("Bad Request: uid and pid are required");
        }
        
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '';
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        const geo = await getCountryFromIp(ip);

        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: ip,
            country: geo.country,
            countryCode: geo.countryCode,
            status: "Complete"
        });
        
        if (!survey) {
            console.error("Unable to register the survey");
            return res.status(500).send("Unable to register the survey");
        }

        const html = renderSurveyTemplate(survey.status, survey.pid, survey.uid, survey.ipAddress, survey.createdAt);
        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

export async function terminateSurvey(req, res) {
    try {
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).send("Bad Request: uid and pid are required");
        }
        
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '';
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        const geo = await getCountryFromIp(ip);

        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: ip,
            country: geo.country,
            countryCode: geo.countryCode,
            status: "Terminate"
        });
        
        if (!survey) {
            console.error("Unable to register the survey");
            return res.status(500).send("Unable to register the survey");
        }

        const html = renderSurveyTemplate(survey.status, survey.pid, survey.uid, survey.ipAddress, survey.createdAt);
        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

export async function quotafullSurvey(req, res) {
    try {
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).send("Bad Request: uid and pid are required");
        }
        
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '';
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        const geo = await getCountryFromIp(ip);

        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: ip,
            country: geo.country,
            countryCode: geo.countryCode,
            status: "Quota Full"
        });
        
        if (!survey) {
            console.error("Unable to register the survey");
            return res.status(500).send("Unable to register the survey");
        }

        const html = renderSurveyTemplate(survey.status, survey.pid, survey.uid, survey.ipAddress, survey.createdAt);
        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

export async function securitytermSurvey(req, res) {
    try {
        const uid = req.query.uid;
        const pid = req.query.pid;
        if (!uid || !pid) {
            return res.status(400).send("Bad Request: uid and pid are required");
        }
        
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '';
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        
        const geo = await getCountryFromIp(ip);

        const survey = await SurveyModel.create({
            uid: uid,
            pid: pid,
            ipAddress: ip,
            country: geo.country,
            countryCode: geo.countryCode,
            status: "Security Term"
        });

        if (!survey) {
            console.error("Unable to register the survey");
            return res.status(500).send("Unable to register the survey");
        }

        const html = renderSurveyTemplate(survey.status, survey.pid, survey.uid, survey.ipAddress, survey.createdAt);
        res.setHeader("Content-Type", "text/html");
        return res.status(200).send(html);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}


