import { format, parseISO, parseJSON, parse, getUnixTime } from 'date-fns';
import { ouch } from '#ving/utils/ouch.mjs';
import { isArray, isString } from '#ving/utils/identify.mjs';

const dt = {

    /**
     * Figures out what kind of date it was passed and returns a javascript date object
     * 
     * @param input Usually a Javascript Date object, or a JSON Date string. But it can also be an array containing a date string of any type along with a [parse pattern](https://date-fns.org/v2.30.0/docs/parse) as the second element of the array. Or even an ISO date string (MySQL date). 
     * @returns A javascript Date object
     * @example
     * const date = dt.determineDate("2012-04-23T18:25:43.511Z")
     */
    determineDate(input) {
        if (isArray(input) && isString(input[0])) {
            // date + input pattern
            return parse(input[0], input[1], new Date());
        }
        else if (input instanceof Date) {
            return input;
        }
        else if (isString(input) && input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
            return parseISO(input);
        }
        else if (isString(input) && input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+/)) {
            return parseJSON(input);
        }
        console.error('Have no idea what type this date is: ', input);
        throw ouch(400, 'bad date object', input);
    },

    /**
     * Formats a date to a human readable string with an American time format. 
     * 
     * @param input Anything that `determineDate()` understands. 
     * @param pattern Optional, defaults to `LLLL d, y h:mm a`. A [format pattern](https://date-fns.org/v2.30.0/docs/format)
     * @returns A formatted string. Example: `April 23, 2012 6:25pm`
     * @example
     * const formatted = dt.formatDate("2012-04-23T18:25:43.511Z")

     */

    formatDateTime(input, pattern = "LLLL d, y h:mm a") {
        try {
            const date = this.determineDate(input);
            return format(date, pattern)
        }
        catch {
            return 'bad date object';
        }
    },

    /**
     * Formats a date to a human readable string. 
     * 
     * @param input Anything that `determineDate()` understands. 
     * @param pattern Optional, defaults to `"LLLL d, y"`. A [format pattern](https://date-fns.org/v2.30.0/docs/format)
     * @returns A formatted string. Example: `April 23, 2012`
     * @example
     * const formatted = dt.formatDate("2012-04-23T18:25:43.511Z")
     */
    formatDate(input, pattern = "LLLL d, y") {
        return this.formatDateTime(input, pattern);
    },

    /**
     * Turns a date into a duration in the past or the future.
     * 
     * @param input Anything that `determineDate()` understands. 
     * @returns An ago formatted string. Example: `13 years ago`
     * @example
     * const formatted = dt.formatTimeAgo("2012-04-23T18:25:43.511Z")
     */
    formatTimeAgo(input) {
        const duration = getUnixTime(new Date()) - getUnixTime(this.determineDate(input));
        const abs_dur = Math.abs(duration);
        let message = '';
        if (abs_dur < 60) {
            message = Math.round(abs_dur).toString();
            message += message == '1' ? " second" : " seconds";
        } else if (abs_dur < 3600) {
            message = Math.round(abs_dur / 60).toString();
            message += message == '1' ? " minute" : " minutes";
        } else if (abs_dur < 86400) {
            message = Math.round(abs_dur / 3600).toString();
            message += message == '1' ? " hour" : " hours";
        } else if (abs_dur < 604800) {
            message = Math.round(abs_dur / 86400).toString();
            message += message == '1' ? " day" : " days";
        } else if (abs_dur < 2419200) {
            message = Math.round(abs_dur / 604800).toString();
            message += message == '1' ? " week" : " weeks";
        } else if (abs_dur < 31536000) {
            message = Math.round(abs_dur / 2419200).toString();
            message += message == '1' ? " month" : " months";
        } else {
            message = Math.round(abs_dur / 31536000).toString();
            message += message == '1' ? " year" : " years";
        }
        if (duration < 0) {
            message += " from now";
        } else {
            message += " ago";
        }
        return message;
    }
};

export default () => {
    return dt;
}