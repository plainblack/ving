import Keyv from 'keyv'

let cache: any = undefined;

export const useCache = () => {
    if (cache) {
        return cache
    }
    const globalForKeyv = global as unknown as { keyv: Keyv }

    cache = globalForKeyv.keyv || new Keyv(process.env.KEYV_PROVIDER_URL);

    if (process.env.NODE_ENV !== 'production')
        globalForKeyv.keyv = cache;

    return cache;
}

cache = useCache();