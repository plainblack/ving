import Redis from 'ioredis';
import '#ving/config.mjs';

/**
 * Spawns a new connection to redis
 * 
 * @returns an  `IORedis` connection
 */
export const spawnRedis = () => {
    const redisUrl = process.env.VING_REDIS || '';
    if (!redisUrl) {
        throw new Error('VING_REDIS environment variable is not set');
    }
    return new Redis(redisUrl, { maxRetriesPerRequest: null });
}

let redis = undefined;

/**
 * Provides a shared reusable connection to redis.
 * 
 * @returns an  `IORedis` connection
 */
export const useRedis = () => {
    if (redis) {
        return redis
    }
    return redis = spawnRedis();
}

redis = useRedis();