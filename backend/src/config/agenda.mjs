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
        if (!vendor || !vendor.postbackUrl) {
            console.log(`No postbackUrl for vendor ${vendor ? vendor.name : 'Unknown'}`);
            return;
        }

        // Replace macros: {{status}} with transaction status, {{vendor_rid}} with Transaction.vendorRid.
        let postbackUrl = vendor.postbackUrl
            .replace('{{status}}', transaction.status)
            .replace('{{vendor_rid}}', transaction.vendorRid || '');

        console.log(`Firing webhook to vendor ${vendor.name}: ${postbackUrl}`);
        
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
