import express from 'express';
import {getSurveyCount, getRecentSurveys, getCompletedSurveys, getTerminatedSurveys, getQuotaFullSurveys, getSecurityTermSurveys, removeSurvey,updateSurvey} from "./../controllers/dashboard.controller.mjs"
import authMiddleware from '../middleware/auth.middleware.mjs';


const dashboardRouter = express.Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get('/getcount', getSurveyCount);

dashboardRouter.get('/getRecentSurveys', getRecentSurveys);
dashboardRouter.get('/getCompletedSurveys', getCompletedSurveys);
dashboardRouter.get('/getTerminatedSurveys', getTerminatedSurveys);
dashboardRouter.get('/getQuotaFullSurveys', getQuotaFullSurveys);
dashboardRouter.get('/getSecurityTermSurveys', getSecurityTermSurveys);
dashboardRouter.delete('/remove/:id',removeSurvey)
dashboardRouter.put('/update/:id',updateSurvey)

export default dashboardRouter;
