import Keyv from 'keyv';
import { ouch } from '#ving/utils/ouch.mjs';
import { log } from '#ving/utils/log.mjs';
let cache = undefined;

/**
 * Connects to the redis cache and returns a cache object
 * @returns a `Keyv` cache
 */
export const useCache = () => {
    if (cache) {
        return cache
    }
    log('cache').info('Connecting to cache');
    const globalForKeyv = global;
    log('cache').info('redis url' + process.env.VING_REDIS);

    cache = globalForKeyv.keyv || new Keyv(process.env.VING_REDIS);

    if (process.env.NODE_ENV !== 'production')
        log('cache').info('got here, this could be the problem');
    log('cache').debug(JSON.stringify(cache));
    log('cache').debug(JSON.stringify(globalForKeyv));
    globalForKeyv.keyv = cache;

    cache.on('error', () => {
        log('cache').info('Error connecting to Cache' + process.env.VING_REDIS);
        throw ouch(504, 'Error connecting to Cache');
    });

    return cache;
}

cache = useCache();