import TransactionModel from '../models/transaction.model.mjs';
import agenda from '../config/agenda.mjs';

export const processSupplierWebhook = async (supplierId, payload) => {
    const { uid, status } = payload; // uid is the transactionToken

    if (!uid) {
        throw new Error('Missing uid in webhook payload');
    }

    const transaction = await TransactionModel.findOne({ transactionToken: uid });
    if (!transaction) {
        // We log and ignore if transaction isn't found
        console.warn(`Webhook received for unknown transactionToken: ${uid}`);
        return;
    }

    // Update status based on webhook
    // Supplier status mapping might be needed here, assuming it sends 'completed' or we map to 'completed'
    let mappedStatus = 'completed'; // default to completed, adjust logic based on exact supplier payloads
    if (status) {
        if (['completed', 'screened_out', 'quota_full', 'fraud', 'terminate', 'security_term'].includes(status.toLowerCase())) {
            mappedStatus = status.toLowerCase();
        }
    }

    transaction.status = mappedStatus;
    if (mappedStatus === 'completed') {
        transaction.completedAt = new Date();
    }
    await transaction.save();

    // Schedule propagation webhook to downstream Vendor
    await agenda.now('propagate-webhook', { transactionId: transaction._id });
};
