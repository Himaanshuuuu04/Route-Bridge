import mongoose from 'mongoose';
const { Schema } = mongoose;

const vendorSchema = new Schema({
    name: { type: String, required: true },
    completeUrl: { type: String },
    terminateUrl: { type: String },
    quotaFullUrl: { type: String },
    securityTermUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const VendorModel = mongoose.model('Vendor', vendorSchema);
export default VendorModel;
