import Redis from 'ioredis';

let redis = undefined;

export const useRedis = () => {
    if (redis) {
        return redis
    }
    return redis = new Redis(process.env.VING_REDIS || '', { maxRetriesPerRequest: null });
}

redis = useRedis();