import express from 'express';
import {
    getSurveys,
    createSurvey,
    getSurveyById,
    updateSurvey,
    deleteSurvey,
    getSuppliers,
    createSupplier,
    deleteSupplier,
    getVendors,
    createVendor,
    deleteVendor,
    getTransactions,
    deleteTransaction
} from '../controllers/surveyAdmin.controller.mjs';

const surveyAdminRoutes = express.Router();

// Suppliers
surveyAdminRoutes.get('/suppliers', getSuppliers);
surveyAdminRoutes.post('/suppliers', createSupplier);
surveyAdminRoutes.delete('/suppliers/:id', deleteSupplier);

// Vendors
surveyAdminRoutes.get('/vendors', getVendors);
surveyAdminRoutes.post('/vendors', createVendor);
surveyAdminRoutes.delete('/vendors/:id', deleteVendor);

// Transactions
surveyAdminRoutes.get('/transactions', getTransactions);
surveyAdminRoutes.delete('/transactions/:id', deleteTransaction);

// Surveys
surveyAdminRoutes.get('/', getSurveys);
surveyAdminRoutes.post('/', createSurvey);
surveyAdminRoutes.get('/:id', getSurveyById);
surveyAdminRoutes.put('/:id', updateSurvey);
surveyAdminRoutes.delete('/:id', deleteSurvey);

export default surveyAdminRoutes;
