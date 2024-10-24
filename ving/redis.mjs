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
    const redisConfig = new URL(redisUrl);
    const redisNode = {
        port: parseInt(redisConfig.port || 6379),
        host: redisConfig.hostname,
    };
    const redisOptions = { maxRetriesPerRequest: null, keyPrefix: process.env.NODE_ENV };
    if (redisConfig.password) {
        redisOptions.password = redisConfig.password;
    }
    if (redisConfig.username) {
        redisOptions.username = redisConfig.username;
    }
    if (redisConfig.protocol === 'rediss:') {
        redisOptions.tls = {};
    }
    if (redisConfig.searchParams.get('cluster') === 'yes') {
        return new Redis.Cluster([redisNode], {
            slotsRefreshTimeout: 20000,
            redisOptions,
        });
    }
    return new Redis(redisNode.port, redisNode.host, redisOptions);
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