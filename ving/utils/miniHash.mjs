/**
 * Generates a hash string to shorten a text string of arbitrary length into a repeatable 8 character string.
 * @param {string} input a string of any length
 * @returns an 8 character string
 */
export const miniHash = (s) => {
    for (var h = 0, i = 0; i < s.length; h &= h)
        h = 31 * h + s.charCodeAt(i++);
    return Math.abs(h).toString(16);
}