import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
dotenv.config({ path: '../.env', quiet: true });

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null // Required by BullMQ
});

redisConnection.on('connect', () => {
    console.log('Redis connected successfully');
});

redisConnection.on('error', (err) => {
    console.error('Redis Client Error', err);
});

export default redisConnection;
