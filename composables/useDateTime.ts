import { ouch } from '~/server/helpers';
import { format, parseISO, parseJSON, parse, getUnixTime } from 'date-fns';

type DTinput = string | string[] | Date | undefined;

const dt = {

    determineDate(input: DTinput) {
        if (Array.isArray(input) && typeof input[0] === "string") {
            // date + input pattern
            return parse(input[0], input[1], new Date());
        }
        else if (input instanceof Date) {
            return input;
        }
        else if (typeof input === 'string' && input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
            return parseISO(input);
        }
        else if (typeof input === 'string' && input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+/)) {
            return parseJSON(input);
        }
        console.error('Have no idea what type this date is: ', input);
        throw ouch(400, 'bad date object', input);
    },

    formatDateTime(input: DTinput, pattern: string = "LLLL d, y h:mm a") {
        const date = this.determineDate(input);
        return format(date, pattern)
    },

    formatDate(input: DTinput, pattern: string = "LLLL d, y") {
        return this.formatDateTime(input, pattern);
    },

    formatTimeAgo(input: DTinput) {
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