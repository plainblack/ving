import Keyv from 'keyv';
import { ouch } from '#ving/utils/ouch.mjs';
import { useRedis } from '#ving/redis.mjs';
import { KeyvAnyRedis } from 'keyv-anyredis';

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
    const store = new KeyvAnyRedis(useRedis());
    cache = globalForKeyv.keyv || new Keyv({ store });

    if (process.env.NODE_ENV !== 'production')
        globalForKeyv.keyv = cache;

    cache.on('error', () => {
        throw ouch(504, 'Error connecting to Cache');
    });

    return cache;
}

cache = useCache();