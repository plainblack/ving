import { createError } from 'h3';
import _ from 'lodash';

const errorCodes = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    409: 'Conflict',
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    429: 'Too Many Requests',
    441: 'Missing Required Parameter',
    442: 'Out of Range',
    454: 'Password Incorrect',
    499: 'Offline Processing',
    500: 'Undefined Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    504: 'Could Not Connect',
};

export const ouch = (code: keyof typeof errorCodes, error: string | unknown, data?: any) => {
    let message = '';
    if (_.isString(error)) {
        message = error;
    }
    else if (_.isObject(error) && 'message' in error && _.isString(error.message)) {
        message = error.message;
    }
    else {
        message = 'Unknown error';
        data = error;
    }
    return createError({
        statusCode: code,
        statusMessage: errorCodes[code || 500],
        message,
        data,
    })
}

export const bleep = (error: any): string => {
    if ('message' in error) {
        return error.message;
    }
    return error;
}