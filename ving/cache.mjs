import Keyv from 'keyv';
import { ouch } from '#ving/utils/ouch.mjs';
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

    cache = globalForKeyv.keyv || new Keyv(process.env.VING_REDIS);

    if (process.env.NODE_ENV !== 'production')
        globalForKeyv.keyv = cache;

    cache.on('error', () => {
        throw ouch(504, 'Error connecting to Cache');
    });

    return cache;
}

cache = useCache();