import { createError } from 'h3';
import { isObject, isString } from '#ving/utils/identify.mjs';

/**
 * The list of error codes matching a basic message that `ouch` supports to give an HTTP status message. An unknown code will result in a `500` status message
 */
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

/**
 * Formats an `Error` object that is structured in a specific way so that it can return a 3 digit HTTP error code.
 * @param {number} code The error code from the list of `errorCodes`
 * @param {string} error A message to be displayed about why the error occurred
 * @param {Object} data Data that may be used to debug the error
 * @returns An `Error` object that can be `throw`n
 */
export const ouch = (code, error, data) => {
    let message = '';
    if (isString(error)) {
        message = error;
    }
    else if (isObject(error) && 'message' in error && isString(error.message)) {
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

/** 
 * Formats an error message as a string
 * @param {Object} error any `Error` object
 * @returns a string as an error message
*/
export const bleep = (error) => {
    if ('message' in error) {
        return error.message;
    }
    return error;
}