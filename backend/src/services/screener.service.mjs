import crypto from 'crypto';
import SurveyModel from '../models/survey.model.mjs';
import RespondentModel from '../models/respondent.model.mjs';
import TransactionModel from '../models/transaction.model.mjs';
import VendorModel from '../models/vendor.model.mjs';

export const getScreenerConfig = async (hash) => {
    const survey = await SurveyModel.findOne({ 'vendorLinks.hash': hash, status: 'active' });
    if (!survey) {
        throw new Error('Survey not found or inactive');
    }
    return survey.eligibilityRules;
};

export const submitScreener = async ({ hash, vendor_rid, answers, ipAddress, sessionFingerprint }) => {
    const survey = await SurveyModel.findOne({ 'vendorLinks.hash': hash, status: 'active' });
    if (!survey) {
        throw new Error('Survey not found or inactive');
    }

    // Identify Vendor
    const vendorLink = survey.vendorLinks.find(link => link.hash === hash);
    const vendorId = vendorLink.vendorId;

    // Step 1: Find or Create Respondent
    // Here we can use sessionFingerprint, IP, or email (if provided in answers)
    // For simplicity we create a new one or update if email exists
    let respondent;
    if (answers.email) {
        respondent = await RespondentModel.findOne({ email: answers.email });
    }
    if (!respondent) {
        respondent = new RespondentModel({
            email: answers.email,
            demographics: answers
        });
        await respondent.save();
    } else {
        // Update demographics
        respondent.demographics = { ...respondent.demographics, ...answers };
        await respondent.save();
    }

    // Step 2: Evaluate Answers against eligibilityRules
    // Logic: check if the user's selected option is included in the acceptedAnswers array
    let isQualified = true;
    if (survey.eligibilityRules && survey.eligibilityRules.length > 0) {
        for (const rule of survey.eligibilityRules) {
            const userAnswer = answers[rule.question];
            if (!userAnswer || !rule.acceptedAnswers.includes(userAnswer)) {
                isQualified = false;
                break;
            }
        }
    }

    if (!isQualified) {
        // Update respondent history
        respondent.history.screenedOut += 1;
        await respondent.save();

        // Create transaction as screened_out
        const transactionToken = vendor_rid || crypto.randomUUID();
        await TransactionModel.create({
            transactionToken,
            surveyId: survey._id,
            vendorId,
            respondentId: respondent._id,
            vendorRid: vendor_rid,
            ipAddress,
            status: 'screened_out'
        });

        return { status: 'screened_out' };
    }

    // Qualified
    respondent.history.started += 1;
    await respondent.save();

    // Step 3: Use vendor_rid as transaction token (or fallback to generated UUID if missing)
    const transactionToken = vendor_rid || crypto.randomUUID();

    // Step 4: Create transaction
    await TransactionModel.create({
        transactionToken,
        surveyId: survey._id,
        vendorId,
        respondentId: respondent._id,
        vendorRid: vendor_rid,
        ipAddress,
        status: 'started'
    });

    // Step 5: Link Encoding
    const redirectUrl = survey.baseSupplierUrl.replace('[identifier]', transactionToken);

    return { status: 'qualified', redirectUrl };
};
