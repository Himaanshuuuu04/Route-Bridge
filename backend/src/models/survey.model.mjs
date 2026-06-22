import mongoose from 'mongoose';
const { Schema } = mongoose;

const surveySchema = new Schema({
    name: { type: String, required: true },
    projectId: { type: String, required: true }, // Identifier used by upstream supplier
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    baseSupplierUrl: { type: String, required: true }, // e.g., https://supplier.com/survey?uid=[identifier]
    status: { type: String, enum: ['active', 'paused', 'closed'], default: 'active' },
    eligibilityRules: { type: Schema.Types.Mixed }, // Stores required age limits, gender, etc.
    vendorLinks: [{
        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        hash: { type: String, unique: true, sparse: true, index: true },
        quota: { type: Number, default: 0 }
    }]
}, { timestamps: true });

const SurveyModel = mongoose.model('Survey', surveySchema);
export default SurveyModel;
