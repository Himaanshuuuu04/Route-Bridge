import express from 'express';
import {getSurveyCount, getRecentSurveys, getCompletedSurveys, getTerminatedSurveys, getQuotaFullSurveys, getSecurityTermSurveys, removeSurvey,updateSurvey} from "./../controllers/dashboard.controller.mjs"
import authMiddleware from '../middleware/auth.middleware.mjs';


const SurveyRouter = express.Router();
SurveyRouter.use(authMiddleware);
SurveyRouter.get('/getcount', getSurveyCount);
SurveyRouter.get('/getRecentSurveys', getRecentSurveys);
SurveyRouter.get('/getCompletedSurveys', getCompletedSurveys);
SurveyRouter.get('/getTerminatedSurveys', getTerminatedSurveys);
SurveyRouter.get('/getQuotaFullSurveys', getQuotaFullSurveys);
SurveyRouter.get('/getSecurityTermSurveys', getSecurityTermSurveys);
SurveyRouter.delete('/remove/:id',removeSurvey)
SurveyRouter.put('/update/:id',updateSurvey)

export default SurveyRouter;
