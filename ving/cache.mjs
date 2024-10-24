import Keyv from 'keyv';
import { ouch } from '#ving/utils/ouch.mjs';
import '#ving/config.mjs';
import '@keyv/redis';

let cache = undefined;

/**
 * Connects to the redis cache and returns a cache object
 * @returns a `Keyv` cache
 */
export const useCache = () => {
    if (cache) {
        return cache
    }
    const globalForKeyv = global;
    const redisUrl = process.env.VING_REDIS || '';
    if (!redisUrl) {
        throw new Error('VING_REDIS environment variable is not set');
    }
    cache = globalForKeyv.keyv || new Keyv(redisUrl);

    if (process.env.NODE_ENV !== 'production')
        globalForKeyv.keyv = cache;

    cache.on('error', () => {
        throw ouch(504, 'Error connecting to Cache');
    });

    return cache;
}

cache = useCache();