export const findObject = <T>(field: keyof T, value: string, list: T[]): T => {
    const index = list.findIndex((obj: T) => obj[field] == value);
    if (index >= 0) {
        return list[index];
    }
    else {
        throw ouch(404, 'cannot find "' + value + '" in "' + field.toString() + '" of  object');
    }
}

export const ucFirst = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const codes = {
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

export const ouch = (code: keyof typeof codes, message: string, data?: any) => {
    return createError({
        statusCode: code,
        statusMessage: codes[code || 500],
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

export const testRequired = (list: string[], params: Record<string, any>) => {
    for (const field of list) {
        if (!(field in params) || params[field] === undefined || params[field] == '') {
            throw ouch(441, `${field} is required.`, field);
        }
    }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};