import mongoose from 'mongoose';
const { Schema } = mongoose;

const vendorSchema = new Schema({
    name: { type: String, required: true },
    postbackUrl: { type: String }, // Where we send our webhooks
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const VendorModel = mongoose.model('Vendor', vendorSchema);
export default VendorModel;
