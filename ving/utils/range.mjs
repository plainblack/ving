/**
 * Creates an array of numbers between start and stop.
 * @param {number} start The first value in the array.
 * @param {number} stop The last value in the array.
 * @param {number} step Defaults to 1.
 * @returns {number[]} A range of numbers
 * @example
 * range(3,7) // [3,4,5,6,7]
 */
export const range = (start, stop, step = 1) =>
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step);