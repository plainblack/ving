import { MySql2Database, like, eq, asc, desc, and, or, ne, SQL, sql, Name, AnyMySqlColumn } from '../../server/drizzle/orm';
import { H3Event, getQuery, readBody } from 'h3';
import { QueryFilter } from '../../types';
import { ouch } from '../../utils/ouch';
import { DescribeListParams, DescribeParams, Roles } from '../../types';
import _ from 'lodash';

export const describeListWhere = (event: H3Event, filter: QueryFilter) => {
    let where: SQL | undefined = undefined;
    const query = getQuery(event);
    if (query.search) {
        for (const column of filter.queryable) {
            if (where === undefined) {
                where = like(column, `%${query.search}%`);
            }
            else {
                where = or(where, like(column, `%${query.search}%`));
            }
        }
    }
    return where;
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

export const obtainSession = (event: H3Event) => {
    if (event && event.context && event.context.ving && event.context.ving.session) {
        return event.context.ving.session;
    }
    return undefined;
}

export const obtainSessionIfRole = (event: H3Event, role: keyof Roles) => {
    const session = obtainSession(event);
    if (session) {
        session.isRoleOrDie(role);
        return session;
    }
    throw ouch(401, 'Login required.')
}

export const includeParams = (event: H3Event) => {
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

export const describeParams = (event: H3Event) => {
    return { currentUser: obtainSession(event), include: includeParams(event) };
}

export const describeListParams = (event: H3Event) => {
    return { ...pagingParams(event), objectParams: { currentUser: obtainSession(event), include: includeParams(event) } };
}

export const pagingParams = (event: H3Event) => {
    const params = getQuery(event);
    const paging: DescribeListParams = { itemsPerPage: 10, page: 1, sortBy: ['createdAt'], sortOrder: 'asc' };
    if (params !== undefined) {
        if (params.itemsPerPage)
            paging.itemsPerPage = Number(params.itemsPerPage);
        if (params.page)
            paging.page = Number(params.page);
        if (params.sortBy && _.isString(params.sortBy))
            paging.sortBy = [params.sortBy];
        if (params.sortBy && _.isArray(params.sortBy))
            paging.sortBy = params.sortBy as string[];
        if (params.sortOrder && _.isString(params.sortOrder) && ['asc', 'desc'].includes(params.sortOrder))
            paging.sortOrder = params.sortOrder as 'asc' | 'desc';
    }
    return paging;
}

export const getBody = async (event: H3Event) => {
    const body = await readBody(event);
    if (body === undefined || (body && _.isObjectLike(body)))
        return body;
    throw ouch(400, 'Malformed body JSON. Perhaps you have a dangling comma.');
}