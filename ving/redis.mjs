import Redis from 'ioredis';

let redis = undefined;

/**
 * Connect to Redis.
 * 
 * @returns an  `IORedis` connection
 */
export const useRedis = () => {
    if (redis) {
        return redis
    }
    return redis = new Redis(process.env.VING_REDIS || '', { maxRetriesPerRequest: null });
}

redis = useRedis();