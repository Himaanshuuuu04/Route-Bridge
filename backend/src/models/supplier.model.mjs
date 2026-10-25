import mongoose from 'mongoose';
const { Schema } = mongoose;

const supplierSchema = new Schema({
    name: { type: String, required: true },
    postbackUrl: { type: String }, // Optional default webhook template
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const SupplierModel = mongoose.model('Supplier', supplierSchema);
export default SupplierModel;
