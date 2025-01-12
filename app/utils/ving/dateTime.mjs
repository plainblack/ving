import { isArray, isString, isUndefined } from '#ving/utils/identify.mjs';
import { createError } from 'h3';

/**
 * Figures out what kind of date it was passed and returns a javascript date object
 * 
 * @param input Usually a Javascript Date object, or a JSON Date string. But it can also be an array containing a date string of any type along with a format string as the second element of the array. Or even an ISO date string (MySQL date). 
 * @returns A javascript Date object
 * @example
 * const date = determineDate("2012-04-23T18:25:43.511Z")
 */
export const determineDate = (input) => {
    if (isUndefined(input)) {
        return new Date();
    }
    if (isArray(input) && isString(input[0])) {
        // date + input pattern - attempt to parse with given format
        const date = new Date(input[0]);
        if (!isNaN(date)) return date;
        throw createError({ statusCode: 400, message: 'Invalid date format with pattern: ' + input });
    }
    if (input instanceof Date) {
        return input;
    }
    if (isString(input)) {
        const date = new Date(input);
        if (!isNaN(date)) return date;
    }
    console.error('Have no idea what type this date is: ', input);
    throw createError({ statusCode: 400, message: 'Have no idea what type this date is: ' + input });
}

/**
 * Formats a date to a human readable string with an American time format. 
 * 
 * @param input Anything that `determineDate()` understands. 
 * @param options Optional Intl.DateTimeFormat options, defaults to showing full month, day, year, hour and minute in 12-hour format
 * @returns A formatted string. Example: `April 23, 2012 6:25 PM`
 * @example
 * const formatted = formatDateTime("2012-04-23T18:25:43.511Z")
 */
/**
 * @typedef {Object} DateTimeFormatOptions
 * @property {'numeric'|'2-digit'|'long'|'short'|'narrow'} [month='long']
 * @property {'numeric'|'2-digit'} [day='numeric']
 * @property {'numeric'|'2-digit'} [year='numeric']
 * @property {'numeric'|'2-digit'} [hour='numeric']
 * @property {'numeric'|'2-digit'} [minute='2-digit']
 * @property {boolean} [hour12=true]
 */

export const formatDateTime = (input, /** @type {DateTimeFormatOptions} */ options = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
}) => {
    try {
        const date = determineDate(input);
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }
    catch {
        return 'bad date object';
    }
}

/**
 * Formats a date to a human readable string. 
 * 
 * @param input Anything that `determineDate()` understands. 
 * @param options Optional Intl.DateTimeFormat options, defaults to showing full month, day, and year
 * @returns A formatted string. Example: `April 23, 2012`
 * @example
 * const formatted = formatDate("2012-04-23T18:25:43.511Z")
 */
/**
 * @typedef {Object} DateFormatOptions
 * @property {'numeric'|'2-digit'|'long'|'short'|'narrow'} [month='long']
 * @property {'numeric'|'2-digit'} [day='numeric']
 * @property {'numeric'|'2-digit'} [year='numeric']
 */

export const formatDate = (input, /** @type {DateFormatOptions} */ options = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
}) => {
    return formatDateTime(input, options);
}

/**
 * Turns a date into a duration in the past or the future.
 * 
 * @param input Anything that `determineDate()` understands. 
 * @returns An ago formatted string. Example: `13 years ago`
 * @example
 * const formatted = formatTimeAgo("2012-04-23T18:25:43.511Z")
 */
export const formatTimeAgo = (input) => {
    const date = determineDate(input);
    const now = new Date();
    const diffInSeconds = (now - date) / 1000;
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

    const intervals = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2419200 },
        { unit: 'week', seconds: 604800 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
        const value = Math.round(Math.abs(diffInSeconds) / interval.seconds);
        if (value >= 1 || interval.unit === 'second') {
            return formatter.format(
                diffInSeconds > 0 ? -value : value,
                interval.unit
            );
        }
    }
    return formatter.format(0, 'second'); // Fallback for edge cases
}
