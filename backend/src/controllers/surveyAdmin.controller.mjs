import crypto from 'crypto';
import SurveyModel from '../models/survey.model.mjs';
import SupplierModel from '../models/supplier.model.mjs';
import VendorModel from '../models/vendor.model.mjs';
import TransactionModel from '../models/transaction.model.mjs';
import redisConnection from '../config/redis.mjs';

// ---- Suppliers ----

export async function getSuppliers(req, res) {
    try {
        const cached = await redisConnection.get('admin:suppliers');
        if (cached) return res.status(200).json(JSON.parse(cached));

        const suppliers = await SupplierModel.find().sort({ createdAt: -1 });
        await redisConnection.set('admin:suppliers', JSON.stringify(suppliers));
        res.status(200).json(suppliers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function createSupplier(req, res) {
    try {
        const { name, postbackUrl, isActive } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });
        
        const newSupplier = new SupplierModel({ name, postbackUrl, isActive });
        await newSupplier.save();
        await redisConnection.del('admin:suppliers');
        res.status(201).json(newSupplier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// ---- Vendors ----

export async function getVendors(req, res) {
    try {
        const cached = await redisConnection.get('admin:vendors');
        if (cached) return res.status(200).json(JSON.parse(cached));

        const vendors = await VendorModel.find().sort({ createdAt: -1 });
        await redisConnection.set('admin:vendors', JSON.stringify(vendors));
        res.status(200).json(vendors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function createVendor(req, res) {
    try {
        const { name, completeUrl, terminateUrl, quotaFullUrl, securityTermUrl, isActive } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });
        
        const newVendor = new VendorModel({ name, completeUrl, terminateUrl, quotaFullUrl, securityTermUrl, isActive });
        await newVendor.save();
        await redisConnection.del('admin:vendors');
        res.status(201).json(newVendor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// ---- Surveys ----

export async function getSurveys(req, res) {
    try {
        const cached = await redisConnection.get('admin:surveys');
        if (cached) return res.status(200).json(JSON.parse(cached));

        const surveys = await SurveyModel.find()
            .populate('supplierId')
            .populate('vendorLinks.vendorId')
            .sort({ createdAt: -1 });
        await redisConnection.set('admin:surveys', JSON.stringify(surveys));
        res.status(200).json(surveys);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getSurveyById(req, res) {
    try {
        const { id } = req.params;
        const survey = await SurveyModel.findById(id)
            .populate('supplierId')
            .populate('vendorLinks.vendorId');
        if (!survey) return res.status(404).json({ message: "Survey not found" });
        res.status(200).json(survey);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function createSurvey(req, res) {
    try {
        const { name, projectId, supplierId, baseSupplierUrl, status, eligibilityRules, vendorLinks, ipFiltering, allowedCountries } = req.body;
        
        // Ensure vendor links have unique hashes
        const processedVendorLinks = (vendorLinks || []).map(link => {
            return {
                ...link,
                hash: link.hash || crypto.randomBytes(8).toString('hex')
            };
        });

        const newSurvey = new SurveyModel({
            name,
            projectId,
            supplierId,
            baseSupplierUrl,
            status,
            ipFiltering,
            allowedCountries,
            eligibilityRules,
            vendorLinks: processedVendorLinks
        });

        await newSurvey.save();
        
        const savedSurvey = await SurveyModel.findById(newSurvey._id)
            .populate('supplierId')
            .populate('vendorLinks.vendorId');
            
        await redisConnection.del('admin:surveys');
        res.status(201).json(savedSurvey);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

export async function updateSurvey(req, res) {
    try {
        const { id } = req.params;
        const { name, projectId, supplierId, baseSupplierUrl, status, eligibilityRules, vendorLinks, ipFiltering, allowedCountries } = req.body;
        
        const processedVendorLinks = (vendorLinks || []).map(link => {
            return {
                ...link,
                hash: link.hash || crypto.randomBytes(8).toString('hex')
            };
        });

        const updatedSurvey = await SurveyModel.findByIdAndUpdate(
            id,
            { name, projectId, supplierId, baseSupplierUrl, status, eligibilityRules, vendorLinks: processedVendorLinks, ipFiltering, allowedCountries },
            { new: true }
        ).populate('supplierId').populate('vendorLinks.vendorId');

        if (!updatedSurvey) return res.status(404).json({ message: "Survey not found" });
        await redisConnection.del('admin:surveys');
        res.status(200).json(updatedSurvey);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function deleteSurvey(req, res) {
    try {
        const { id } = req.params;
        const deletedSurvey = await SurveyModel.findByIdAndDelete(id);
        if (!deletedSurvey) return res.status(404).json({ message: "Survey not found" });
        await redisConnection.del('admin:surveys');
        res.status(200).json(deletedSurvey);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// ---- Transactions ----

export async function getTransactions(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const transactions = await TransactionModel.find()
            .populate('surveyId', 'name projectId')
            .populate('vendorId', 'name')
            .sort({ startedAt: -1 })
            .skip(skip)
            .limit(limit);
            
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function deleteSupplier(req, res) {
    try {
        const { id } = req.params;
        
        // Remove supplier reference from surveys
        await SurveyModel.updateMany({ supplierId: id }, { $unset: { supplierId: "" } });
        
        const deletedSupplier = await SupplierModel.findByIdAndDelete(id);
        if (!deletedSupplier) return res.status(404).json({ message: "Supplier not found" });
        
        await redisConnection.del('admin:suppliers');
        await redisConnection.del('admin:surveys'); // Surveys might have lost a supplier reference
        res.status(200).json({ message: "Supplier deleted successfully", deletedSupplier });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function deleteVendor(req, res) {
    try {
        const { id } = req.params;
        
        // Remove vendor links from surveys
        await SurveyModel.updateMany(
            { "vendorLinks.vendorId": id },
            { $pull: { vendorLinks: { vendorId: id } } }
        );
        
        const deletedVendor = await VendorModel.findByIdAndDelete(id);
        if (!deletedVendor) return res.status(404).json({ message: "Vendor not found" });
        
        await redisConnection.del('admin:vendors');
        await redisConnection.del('admin:surveys'); // Surveys might have lost a vendor reference
        res.status(200).json({ message: "Vendor deleted successfully", deletedVendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function deleteTransaction(req, res) {
    try {
        const { id } = req.params;
        
        const deletedTransaction = await TransactionModel.findByIdAndDelete(id);
        if (!deletedTransaction) return res.status(404).json({ message: "Transaction not found" });
        
        res.status(200).json({ message: "Transaction deleted successfully", deletedTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

