import Agenda from 'agenda';
import axios from 'axios';
import dotenv from 'dotenv';
import TransactionModel from '../models/transaction.model.mjs';
import VendorModel from '../models/vendor.model.mjs';

dotenv.config();
dotenv.config({ path: '../.env' });

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URI,
        collection: 'agendaJobs'
    }
});

agenda.define('propagate-webhook', async (job) => {
    const { transactionId } = job.attrs.data;

    try {
        const transaction = await TransactionModel.findById(transactionId).populate('vendorId');
        
        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        const vendor = transaction.vendorId;
        if (!vendor) {
            console.log(`No vendor found for transaction ${transactionId}`);
            return;
        }

        let targetUrl = '';
        switch (transaction.status) {
            case 'completed':
                targetUrl = vendor.completeUrl;
                break;
            case 'screened_out':
            case 'terminate':
                targetUrl = vendor.terminateUrl;
                break;
            case 'quota_full':
                targetUrl = vendor.quotaFullUrl;
                break;
            case 'security_term':
            case 'fraud':
                targetUrl = vendor.securityTermUrl;
                break;
            default:
                // No mapping or just started/unknown status
                break;
        }

        if (!targetUrl) {
            console.log(`No suitable callback URL configured for status '${transaction.status}' on vendor ${vendor.name}`);
            return;
        }

        // Replace macros: {{vendor_rid}} with Transaction.vendorRid.
        let postbackUrl = targetUrl.replace('{{vendor_rid}}', transaction.vendorRid || '');

        console.log(`Firing webhook to vendor ${vendor.name} for status ${transaction.status}: ${postbackUrl}`);
        
        // Fire HTTP GET to downstream vendor
        await axios.get(postbackUrl);
        
        console.log(`Successfully fired webhook for transaction ${transactionId}`);
    } catch (error) {
        console.error(`Failed to propagate webhook for transaction ${transactionId}:`, error.message);
        // Throw error to trigger Agenda's retry mechanism if configured, or just let it fail
        throw error;
    }
});

export const initAgenda = async () => {
    await agenda.start();
    console.log('Agenda.js started successfully');
};

export default agenda;
