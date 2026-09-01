import { Queue } from 'bullmq';
import redisConnection from './redis.mjs';
import '../workers/index.mjs';

// --- Queues ---
export const webhookQueue = new Queue('webhookQueue', { connection: redisConnection });
export const dashboardCacheQueue = new Queue('dashboardCacheQueue', { connection: redisConnection });
export const emailQueue = new Queue('emailQueue', { connection: redisConnection });
