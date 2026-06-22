import mongoose from 'mongoose';
const { Schema } = mongoose;

const legacyCallbackSchema = new Schema({
    ipAddress: { type: String, required: true },
    country: { type: String, default: 'Unknown' },
    countryCode: { type: String, default: 'UN' },
    status: { type: String, required: true, enum: ['Security Term', 'Quota Full', 'Terminate', "Complete"], default: 'Terminate' },
    pid: { type: String, required: true },
    uid: { type: String, required: true }

}
, { timestamps: true });


const LegacyCallbackModel = mongoose.model('LegacyCallback', legacyCallbackSchema);
export default LegacyCallbackModel;
