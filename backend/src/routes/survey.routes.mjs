import express from 'express';
import {completeSurvey, terminateSurvey, quotafullSurvey, securitytermSurvey } from '../controllers/survey.controller.mjs';

const SurveyRouter = express.Router();
SurveyRouter.post('/complete', completeSurvey);
SurveyRouter.post('/terminate', terminateSurvey);
SurveyRouter.post('/quotafull', quotafullSurvey);
SurveyRouter.post('/securityterm', securitytermSurvey);
//dont know the 
SurveyRouter.get('/complete', completeSurvey);
SurveyRouter.get('/terminate', terminateSurvey);
SurveyRouter.get('/quotafull', quotafullSurvey);
SurveyRouter.get('/securityterm', securitytermSurvey);


export default SurveyRouter;
