import { isArray } from '#ving/utils/identify.mjs';

/** 
 * Appends a number to the end of a string, or increments the number if there's already one at the end of the string.
 * @param {string} input - Any string
 * @example
 * appendNumberToString('foo') // foo2
 * appendNumberToString('foo2') // foo3
 */

export default (input) => {
    const matches = input.match(/^(.*?)(\d+)$/);
    let num = (isArray(matches) && matches.length == 3) ? parseInt(matches[2]) : 1;
    let str = (isArray(matches) && matches.length == 3) ? matches[1] : input;
    num++;
    return str + num;
}