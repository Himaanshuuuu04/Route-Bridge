import express from 'express';
import {completeSurvey, terminateSurvey, quotafullSurvey, securitytermSurvey } from '../controllers/survey.controller.mjs';

const SurveyRouter = express.Router();
SurveyRouter.post('/complete', completeSurvey);
SurveyRouter.post('/terminate', terminateSurvey);
SurveyRouter.post('/quotafull', quotafullSurvey);
SurveyRouter.post('/securityterm', securitytermSurvey);

export default SurveyRouter;
