import { DateTime } from 'luxon';
import { ouch } from '~/server/helpers';
import type { DateTime as LDT } from 'luxon'

type DTinput = string | number | string[] | Date | LDT | undefined;
type FormatDateTimeOptions = { outTimeZone?: string, inTimeZone?: string, format?: string };

const dt = {

    DateTime: DateTime,

    date2luxon(input: DTinput = new Date(), timezone: string = "utc"): LDT {
        if (Array.isArray(input) && typeof input[0] === "string") {
            // date + input pattern
            return DateTime.fromFormat(input[0], input[1], {
                zone: timezone,
            });
        }
        else if (typeof input === 'string' && input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+/)) {
            // ISO 8601
            return DateTime.fromISO(input, { zone: 'utc' });
        }
        else if (typeof input === "string" && input.length == 19) {
            // mysql datetime
            return DateTime.fromSQL(input, { zone: timezone });
        } else if (typeof input === "string" && input.length == 10) {
            // mysql date
            return DateTime.fromSQL(input, { zone: timezone });
        } else if (input instanceof DateTime) {
            return input;
        } else if (typeof input === "number" && input > 1000000000000) {
            // milliseconds since epoch
            return DateTime.fromMillis(input, { zone: timezone });
        } else if (typeof input === "number") {
            // seconds since epoch
            return DateTime.fromSeconds(input, { zone: timezone });
        } else if (input instanceof Date) {
            // must be a normal JS date
            return DateTime.fromJSDate(input);
        }
        else {
            console.error('Have no idea what type this date is: ', input);
            throw ouch(400, 'bad date object', input);
        }
    },

    formatDateTime(input: DTinput, options: FormatDateTimeOptions = {}) {
        if (!options.format) {
            options.format = "LLLL d, yyyy h:mm a";
        }
        if (!options.outTimeZone) {
            options.outTimeZone = "local";
        }
        if (!options.inTimeZone) {
            options.inTimeZone = "utc";
        }
        let dt = this.date2luxon(input, options.inTimeZone);
        if (typeof options.outTimeZone !== "undefined") {
            dt = dt.setZone(options.outTimeZone);
        }
        return dt.toFormat(options.format);
    },

    formatDate(input: DTinput, options: FormatDateTimeOptions = {}) {
        if (!options.format) {
            options.format = "LLLL d, yyyy";
        }
        return this.formatDateTime(input, options);
    },

    formatTimeAgo(input: DTinput) {
        const duration =
            DateTime.utc().toSeconds() - this.date2luxon(input).toSeconds();
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