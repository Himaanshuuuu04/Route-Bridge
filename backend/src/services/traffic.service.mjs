import SurveyModel from '../models/survey.model.mjs';

export const handleTrafficRouting = async (hash, vendorRid) => {
    const survey = await SurveyModel.findOne({
        'vendorLinks.hash': hash,
        status: 'active'
    });

    if (!survey) {
        throw new Error('Survey not found or inactive');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Redirect to screener UI
    return `${frontendUrl}/screener/${hash}?vendor_rid=${vendorRid || ''}`;
};
