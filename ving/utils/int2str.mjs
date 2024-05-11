import { encode, decode } from './base62.mjs';
import { encrypt, decrypt } from './skipjack.mjs';

export const stringifyId = (int) => encode(encrypt(int));
export const parseId = (str) => decrypt(decode(str));