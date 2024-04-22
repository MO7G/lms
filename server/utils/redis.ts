import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Function to clear the Redis cache
export const clearCache = async (redis : any) => {
    try {
        if (process.env.CLEAR_REDIS_CACHE === 'true') {
            console.log('Clearing Redis cache...');
            await redis.flushall();
            console.log('Redis cache cleared successfully.');
        } else {
            console.log('CLEAR_REDIS_CACHE flag is not set to true. Skipping cache clearing.');
        }
    } catch (error) {
        console.error('Failed to clear Redis cache:', error);
    }
};

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected`);
        const redis = new Redis(process.env.REDIS_URL);
        // Clear Redis cache after connecting
        clearCache(redis);
        return redis;
    }

    throw new Error('Redis connection failed');
};

export function parseRedisExpiration(defaultValue: number): number {
    const redisExpiration = parseInt(process.env.REDIS_EXPIRE || String(defaultValue), 10);

    if (redisExpiration !== defaultValue) {
        return redisExpiration * 24 * 60 * 60; // Convert days to seconds
    }
    return redisExpiration;
}


export const redis = redisClient();
export default clearCache;
