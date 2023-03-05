import Keyv from 'keyv'

const globalForKeyv = global as unknown as { keyv: Keyv }

export const cache = globalForKeyv.keyv || new Keyv(process.env.KEYV_PROVIDER_URL);

if (process.env.NODE_ENV !== 'production')
    globalForKeyv.keyv = cache;