import { like, eq, and, or, gt, lt, gte, lte, ne } from '../../server/drizzle/orm.mjs';
import { getQuery, readBody } from 'h3';
import { ouch } from '#ving/utils/ouch.mjs';
import _ from 'lodash';

const fixColumnData = (column, data) => {
    if (column.getSQLType() == 'datetime' || column.getSQLType() == 'timestamp') {
        if (!data.match(/^"/)) // make it JSON compatible
            data = '"' + data + '"';
        return JSON.parse(data);
    }
    if (column.getSQLType() == 'boolean') {
        return data == 'true' ? true : false;
    }
    if (column.getSQLType() == 'number') {
        return Number(data);
    }
    return data;
}

export const describeListWhere = (event, filter) => {
    let where = undefined;
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
    const ands = [];
    for (const key in query) {
        const value = query[key] || '';
        const matchRange = key.match(/^_(start|end)_(.*)$/);
        if (matchRange) {
            const matchColumn = filter.ranged.find(col => col.name == matchRange[2]);
            if (matchColumn) {
                const data = fixColumnData(matchColumn, value);
                if (matchRange[1] == 'start') {
                    ands.push(gte(matchColumn, data));
                }
                else if (matchRange[1] == 'end') {
                    ands.push(lte(matchColumn, data));
                }
            }
        }
        const matchColumn = filter.qualifiers.find(col => col.name == key);
        if (matchColumn) {
            const matchOp = value.toString().match(/^(>|<|>=|<=|!=|<>)?(.+)$/);
            if (matchOp) {
                const data = fixColumnData(matchColumn, matchOp[2]);
                switch (matchOp[1]) {
                    case '!=':
                    case '<>': {
                        ands.push(ne(matchColumn, data));
                        break;
                    }
                    case '>': {
                        ands.push(gt(matchColumn, data));
                        break;
                    }
                    case '<': {
                        ands.push(lt(matchColumn, data));
                        break;
                    }
                    case '>=': {
                        ands.push(gte(matchColumn, data));
                        break;
                    }
                    case '<=': {
                        ands.push(lte(matchColumn, data));
                        break;
                    }
                    default: {
                        ands.push(eq(matchColumn, data));
                    }
                }
            }
        }
    }
    for (const item of ands) {
        if (where === undefined) {
            where = item;
        }
        else {
            where = and(where, item);
        }
    }
    return where;
}

export const testRequired = (list, params) => {
    if (params === undefined) {
        throw ouch(400, 'No params detected.');
    }
    for (const field of list) {
        if (!(field in params) || params[field] === undefined || params[field] == '') {
            throw ouch(441, `${field} is required.`, field);
        }
    }
}

export const obtainSession = (event) => {
    if (event && event.context && event.context.ving && event.context.ving.session) {
        return event.context.ving.session;
    }
    return undefined;
}

export const obtainSessionIfRole = (event, role) => {
    const session = obtainSession(event);
    if (session) {
        session.isRoleOrDie(role);
        return session;
    }
    throw ouch(401, 'Login required.')
}

export const includeParams = (event) => {
    const params = getQuery(event);
    const include = { options: false, links: false, related: [], extra: [], meta: false };
    if ('includeOptions' in params && params.includeOptions !== undefined && params.includeOptions !== null && !Array.isArray(params.includeOptions)) {
        include.options = /^true$/i.test(params.includeOptions);
    }
    if ('includeLinks' in params && params.includeLinks !== undefined && params.includeLinks !== null && !Array.isArray(params.includeLinks)) {
        include.links = true;
    }
    if ('includeMeta' in params && params.includeMeta !== undefined && params.includeMeta !== null && !Array.isArray(params.includeMeta)) {
        include.meta = true;
    }
    if ('includeRelated' in params && params.includeRelated !== undefined && params.includeRelated !== null) {
        if (Array.isArray(params.includeRelated)) {
            include.related = params.includeRelated;
        }
        else if (include.related !== undefined) {
            include.related.push(params.includeRelated);
        }
    }
    if ('includeExtra' in params && params.includeExtra !== undefined && params.includeExtra !== null) {
        if (Array.isArray(params.includeExtra)) {
            include.extra = params.includeExtra;
        }
        else if (include.extra !== undefined) {
            include.extra.push(params.includeExtra);
        }
    }
    return include;
}

export const describeParams = (event, session) => {
    return { currentUser: session || obtainSession(event), include: includeParams(event) };
}

export const describeListParams = (event, session) => {
    return { ...pagingParams(event), objectParams: { currentUser: session || obtainSession(event), include: includeParams(event) } };
}

export const pagingParams = (event) => {
    const params = getQuery(event);
    const paging = { itemsPerPage: 10, page: 1, sortBy: ['createdAt'], sortOrder: 'asc' };
    if (params !== undefined) {
        if (params.itemsPerPage)
            paging.itemsPerPage = Number(params.itemsPerPage);
        if (params.page)
            paging.page = Number(params.page);
        if (params.sortBy && _.isString(params.sortBy))
            paging.sortBy = [params.sortBy];
        if (params.sortBy && _.isArray(params.sortBy))
            paging.sortBy = params.sortBy;
        if (params.sortOrder && _.isString(params.sortOrder) && ['asc', 'desc'].includes(params.sortOrder))
            paging.sortOrder = params.sortOrder;
    }
    return paging;
}

export const getBody = async (event) => {
    const body = await readBody(event);
    if (body === undefined || (body && _.isObjectLike(body)))
        return body;
    throw ouch(400, 'Malformed body JSON. Perhaps you have a dangling comma.');
}