import Keyv from 'keyv';
import { ouch } from '#ving/utils/ouch.mjs';
import { log } from '#ving/log.mjs';
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
    console.log('redis url' + process.env.VING_REDIS);

    cache = globalForKeyv.keyv || new Keyv(process.env.VING_REDIS);

    if (process.env.NODE_ENV !== 'production')
        console.log('got here, this could be the problem');
    console.log(JSON.stringify(cache));
    console.log(JSON.stringify(globalForKeyv.keyv));
    globalForKeyv.keyv = cache;

    cache.on('error', () => {
        console.log('Error connecting to Cache' + process.env.VING_REDIS);
        throw ouch(504, 'Error connecting to Cache');
    });

    return cache;
}

cache = useCache();