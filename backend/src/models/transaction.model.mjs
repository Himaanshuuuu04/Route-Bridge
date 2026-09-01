import mongoose from 'mongoose';
const { Schema } = mongoose;

const transactionSchema = new Schema({
    transactionToken: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    serial: { type: Number },
    surveyId: { type: Schema.Types.ObjectId, ref: 'Survey' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    vendorRid: { type: String }, // ID passed to us by the vendor on click
    ipAddress: { type: String },
    country: { type: String, default: 'Unknown' },
    countryCode: { type: String, default: 'UN' },
    status: { 
        type: String, 
        enum: ['started', 'completed', 'screened_out', 'quota_full', 'fraud', 'terminate', 'security_term'],
        default: 'started'
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
}, { timestamps: true });

transactionSchema.pre('save', async function () {
    if (this.isNew) {
        if (this.projectId) {
            const lastTx = await this.constructor.findOne({ projectId: this.projectId })
                .sort({ serial: -1 })
                .exec();
            this.serial = lastTx && lastTx.serial !== undefined ? lastTx.serial + 1 : 0;
        } else {
            this.serial = 0;
        }
    }
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);
export default TransactionModel;
