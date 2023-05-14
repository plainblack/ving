import Keyv from 'keyv'
import { ouch } from '../utils/ouch'
let cache: any = undefined;

export const useCache = () => {
    if (cache) {
        return cache
    }
    const globalForKeyv = global as unknown as { keyv: Keyv }

    cache = globalForKeyv.keyv || new Keyv(process.env.KEYV_PROVIDER_URL);

    if (process.env.NODE_ENV !== 'production')
        globalForKeyv.keyv = cache;

    cache.on('error', () => {
        throw ouch(504, 'Error connecting to Cache');
    });

    return cache;
}

cache = useCache();