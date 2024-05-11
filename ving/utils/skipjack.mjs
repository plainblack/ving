import { Skip32 } from 'skip32';
import { isUndefined } from './identify.mjs';
import { log } from '#ving/log.mjs';

const parseKey = () => {
    const key = process.env.VING_SKIPJACK_KEY;
    if (isUndefined(key))
        return [];
    return key.split(',');
}

export const encrypt = (int) => {
    if (int > 4294967295)
        log('skipjack').warning(`${int} is larger than the maximum 32-bit unsigned integer of 4294967295.`);
    return (new Skip32(parseKey())).encrypt(int);
};

export const decrypt = (str) => (new Skip32(parseKey())).decrypt(str);