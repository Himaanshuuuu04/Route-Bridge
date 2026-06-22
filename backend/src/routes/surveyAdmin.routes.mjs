import express from 'express';
import {
    getSurveys,
    createSurvey,
    getSurveyById,
    updateSurvey,
    deleteSurvey,
    getSuppliers,
    createSupplier,
    getVendors,
    createVendor,
    getTransactions
} from '../controllers/surveyAdmin.controller.mjs';

const surveyAdminRoutes = express.Router();

// Suppliers
surveyAdminRoutes.get('/suppliers', getSuppliers);
surveyAdminRoutes.post('/suppliers', createSupplier);

// Vendors
surveyAdminRoutes.get('/vendors', getVendors);
surveyAdminRoutes.post('/vendors', createVendor);

// Transactions
surveyAdminRoutes.get('/transactions', getTransactions);

// Surveys
surveyAdminRoutes.get('/', getSurveys);
surveyAdminRoutes.post('/', createSurvey);
surveyAdminRoutes.get('/:id', getSurveyById);
surveyAdminRoutes.put('/:id', updateSurvey);
surveyAdminRoutes.delete('/:id', deleteSurvey);

export default surveyAdminRoutes;
