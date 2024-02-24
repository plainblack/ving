/**
 * Creates a promise that waits for a specific number of milliseconds
 * @param {number} ms how many milliseconds to sleep for
 * @returns a promise
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));