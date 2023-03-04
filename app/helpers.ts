import { DescribeListParams, DescribeParams } from './db';
import _ from 'lodash';
import { H3Event, createError, getQuery, readBody } from 'h3';

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

export const ouch = (code: keyof typeof errorCodes, message: string, data?: any) => {
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

export const testRequired = (list: string[], params: Record<string, any>) => {
    if (params === undefined) {
        throw ouch(400, 'No params detected.');
    }
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

export const vingSession = (event: H3Event) => {
    if (event && event.context && event.context.ving && event.context.ving.session) {
        return event.context.ving.session;
    }
    return undefined;
}

export const vingInclude = (event: H3Event) => {
    const params = getQuery(event);
    const include: DescribeParams['include'] = { options: false, links: false, related: [], extra: [], meta: false };
    if ('includeOptions' in params && params.includeOptions !== undefined && params.includeOptions !== null && !Array.isArray(params.includeOptions)) {
        include.options = /^true$/i.test(params.includeOptions as string);
    }
    if ('includeLinks' in params && params.includeLinks !== undefined && params.includeLinks !== null && !Array.isArray(params.includeLinks)) {
        include.links = true;
    }
    if ('includeMeta' in params && params.includeMeta !== undefined && params.includeMeta !== null && !Array.isArray(params.includeMeta)) {
        include.meta = true;
    }
    if ('includeRelated' in params && params.includeRelated !== undefined && params.includeRelated !== null) {
        if (Array.isArray(params.includeRelated)) {
            include.related = params.includeRelated as string[];
        }
        else if (include.related !== undefined) {
            include.related.push(params.includeRelated as string);
        }
    }
    if ('includeExtra' in params && params.includeExtra !== undefined && params.includeExtra !== null) {
        if (Array.isArray(params.includeExtra)) {
            include.extra = params.includeExtra as string[];
        }
        else if (include.extra !== undefined) {
            include.extra.push(params.includeExtra as string);
        }
    }
    return include;
}

export const vingDescribe = (event: H3Event) => {
    return { currentUser: vingSession(event), include: vingInclude(event) };
}

export const vingDescribeList = (event: H3Event) => {
    return { ...vingPaging(event), objectParams: { currentUser: vingSession(event), include: vingInclude(event) } };
}

export const vingPaging = (event: H3Event) => {
    const params = getQuery(event);
    const paging: DescribeListParams = { itemsPerPage: 10, pageNumber: 1, orderBy: 'dateCreated', sortOrder: 'asc' };
    if (params !== undefined) {
        if (params.itemsPerPage && _.isNumber(params.itemsPerPage))
            paging.itemsPerPage = params.itemsPerPage;
        if (params.pageNumber && _.isNumber(params.pageNumber))
            paging.pageNumber = params.pageNumber;
        if (params.orderBy && _.isString(params.orderBy))
            paging.orderBy = params.orderBy;
        if (params.sortOrder && _.isString(params.sortOrder) && params.sortOrder in ['asc', 'desc'])
            paging.sortOrder = params.sortOrder as 'asc' | 'desc';
    }
    return paging;
}

export const vingBody = async (event: H3Event) => {
    const body = await readBody(event);
    if (body === undefined || (body && _.isObjectLike(body)))
        return body;
    throw ouch(400, 'Malformed body JSON. Perhaps you have a dangling comma.');
}