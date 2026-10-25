import { Worker } from 'bullmq';
import redisConnection from '../config/redis.mjs';
import { sendMail, sendErrorNotificationMail } from '../helpers/sender.mjs';

const emailWorker = new Worker('emailQueue', async (job) => {
    const { email, name, otp } = job.data;
    try {
        await sendMail(email, name, otp);
        console.log(`Successfully sent OTP email to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error.message);
        throw error;
    }
}, { connection: redisConnection });

emailWorker.on('failed', async (job, err) => {
    console.error(`Email job ${job.id} failed with error ${err.message}`);
    await sendErrorNotificationMail('Email Worker', job, err);
});

export default emailWorker;
