import Keyv from 'keyv';
import { ouch } from '#ving/utils/ouch.mjs';
import { log } from '#ving/log.mjs';
import 'dotenv/config';
let cache = undefined;

/**
 * Connects to the redis cache and returns a cache object
 * @returns a `Keyv` cache
 */
export const useCache = () => {
    if (cache) {
        return cache
    }
    console.log('Connecting to cache');
    const globalForKeyv = global;
    const redisUrl = process.env.VING_REDIS || '';
    if (!redisUrl) {
        throw new Error('VING_REDIS environment variable is not set');
    }
    console.log('redis url' + redisUrl);

    cache = globalForKeyv.keyv || new Keyv(redisUrl);

    if (process.env.NODE_ENV !== 'production')
        console.log('got here, this could be the problem');
    console.log(JSON.stringify(cache));
    console.log(JSON.stringify(globalForKeyv.keyv));
    globalForKeyv.keyv = cache;

    cache.on('error', () => {
        console.log('Error connecting to Cache' + redisUrl);
        throw ouch(504, 'Error connecting to Cache');
    });

    return cache;
}

cache = useCache();