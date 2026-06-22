import express from 'express';
import {getSurveyCount, getRecentSurveys, removeSurvey, updateSurvey} from "./../controllers/dashboard.controller.mjs"
import authMiddleware from '../middleware/auth.middleware.mjs';


const dashboardRouter = express.Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get('/getcount', getSurveyCount);

dashboardRouter.get('/getRecentSurveys', getRecentSurveys);
dashboardRouter.delete('/remove/:id',removeSurvey)
dashboardRouter.put('/update/:id',updateSurvey)

export default dashboardRouter;
