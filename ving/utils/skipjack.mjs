import { Skip32 } from 'skip32';
import { isUndefined } from './identify.mjs';
import { log } from '#ving/log.mjs';

const parseKey = () => {
    const key = process.env.VING_SKIPJACK_KEY;
    if (isUndefined(key))
        return [];
    return key.split(',');
}

/**
 * Encrypts an integer with a set of other integers, see the environment variable `VING_SKIPJACK_KEY`.
 * @param {number} int - An integer between 0 and 4294967295. 
 * @returns {number} An encrypted integer. This value will be different based upon what is set in `VING_SKIPJACK_KEY`.
 * @example
 * encrypt(1) // 39393930
 */
export const encrypt = (int) => {
    if (int > 4294967295)
        log('skipjack').warning(`${int} is larger than the maximum 32-bit unsigned integer of 4294967295.`);
    return (new Skip32(parseKey())).encrypt(int);
};

/**
 * Decrypts an integer that was encrypted with `encrypt()`.
 * @param {number} int - An encrypted integer. 
 * @returns {number} The original integer. 
 * @example
 * encrypt(39393930) // 1
 */
export const decrypt = (str) => (new Skip32(parseKey())).decrypt(str);