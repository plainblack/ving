import Redis from 'ioredis';

/**
 * Spawns a new connection to redis
 * 
 * @returns an  `IORedis` connection
 */
export const spawnRedis = () => {
    return new Redis(process.env.VING_REDIS || '', { maxRetriesPerRequest: null });
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