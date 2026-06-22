import mongoose from 'mongoose';
const { Schema } = mongoose;

const transactionSchema = new Schema({
    transactionToken: { type: String, unique: true, required: true, index: true },
    surveyId: { type: Schema.Types.ObjectId, ref: 'Survey' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    respondentId: { type: Schema.Types.ObjectId, ref: 'Respondent' },
    vendorRid: { type: String }, // ID passed to us by the vendor on click
    status: { 
        type: String, 
        enum: ['started', 'completed', 'screened_out', 'quota_full', 'fraud', 'terminate', 'security_term'],
        default: 'started'
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
}, { timestamps: true });

const TransactionModel = mongoose.model('Transaction', transactionSchema);
export default TransactionModel;
