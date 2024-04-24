import { like, eq, and, or, gt, lt, gte, lte, ne } from '#ving/drizzle/orm.mjs';
import { getQuery, readBody } from 'h3';
import { ouch } from '#ving/utils/ouch.mjs';
import { isObject, isArray, isString, isUndefined, isNil } from '#ving/utils/identify.mjs';

/**
 * Formatting of ingested data to make it match the SQL data where it will be stored. It 
 * turns strings of 'true' and 'false' into the equivalent boolean values. Properly formats
 * dates into something compatible with datetime or timestamp. And casts numbers that are
 * represented as strings into numbers.
 * @param {string} column the name of the column you're fixing data for
 * @param {*} data the data you wish to have formatted
 * @returns Fixed data
 */
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

/**
 * Generates a drizzle where clause to filter a list of `VingRecord`s based upon values passed to a rest interface.
 * @param {Object} event an `H3` event
 * @param {Object} filter a `VingRecord` filter as defined in `describeListFilter()`
 * @see Filters in the Ving Rest documentation.
 * @returns a where clause
 */
export const describeListWhere = (event, filter) => {
    let where = undefined;
    const query = getQuery(event);
    if (query.search) {
        for (const column of filter.queryable) {
            if (isUndefined(where)) {
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
        if (isUndefined(where)) {
            where = item;
        }
        else {
            where = and(where, item);
        }
    }
    return where;
}

/**
 * Tests all required props on a VingRecord
 * @param {string[]} list the list of required props
 * @param {Object} params the list of parameters passed to the web service through the body
 * @throws 400 if the params list is undefined
 * @throws 441 if a field is required and is undefined or empty
 */
export const testRequired = (list, params) => {
    if (isUndefined(params)) {
        throw ouch(400, 'No params detected.');
    }
    for (const field of list) {
        if (!(field in params) || isNil(params[field])) {
            throw ouch(441, `${field} is required.`, field);
        }
    }
}

/**
 * Gets a ving session from an `h3` event
 * @param {Object} event an `h3` event
 * @returns either `undefined` or a `#ving/session.mjs` instance
 */
export const obtainSession = (event) => {
    if (event && event.context && event.context.ving && event.context.ving.session) {
        return event.context.ving.session;
    }
    return undefined;
}

/**
 * Does the same thing as `obtainSession()` but only if the session obtained belongs to a user that has the specified role.
 * @param {Object} event an `h3` event
 * @param {*} role The name of a role as defined in `#ving/schema/schemas/User.mjs`
 * @throws 401 if the specified role is not `true`
 * @returns `true`
 */
export const obtainSessionIfRole = (event, role) => {
    const session = obtainSession(event);
    if (session) {
        session.isRoleOrDie(role);
        return session;
    }
    throw ouch(401, 'Login required.')
}

/**
 * Tests for the various `include` params being passed to the rest service, and if they exist formats them properly for the `describe()` method on a `VingRecord`.
 * @param {Object} event an `h3` event
 * @returns An object with all of the include options
 */
export const includeParams = (event) => {
    const params = getQuery(event);
    const include = { options: false, links: false, related: [], extra: [], meta: false };
    if ('includeOptions' in params && !isNil(params.includeOptions) && !isArray(params.includeOptions)) {
        include.options = /^true$/i.test(params.includeOptions);
    }
    if ('includeLinks' in params && !isNil(params.includeLinks) && !isArray(params.includeLinks)) {
        include.links = true;
    }
    if ('includeMeta' in params && !isNil(params.includeMeta) && !isArray(params.includeMeta)) {
        include.meta = true;
    }
    if ('includeRelated' in params && !isNil(params.includeRelated)) {
        if (isArray(params.includeRelated)) {
            include.related = params.includeRelated;
        }
        else if (!isUndefined(include.related)) {
            include.related.push(params.includeRelated);
        }
    }
    if ('includeExtra' in params && !isNil(params.includeExtra)) {
        if (isArray(params.includeExtra)) {
            include.extra = params.includeExtra;
        }
        else if (!isUndefined(include.extra)) {
            include.extra.push(params.includeExtra);
        }
    }
    return include;
}

/**
 * Calls `includeParams()` and `obtainSession()` if needed, and returns the list of describe params needed by the `describe` method in a `VingRecord`
 * @param {Object} event an `h3` event
 * @param {Object} session Optional, a Ving session instance
 * @returns An object containing the describe params
 */
export const describeParams = (event, session) => {
    return { currentUser: session || obtainSession(event), include: includeParams(event) };
}

/**
 * Calls `pagingParams()`, `obtainSession()`, and `includeParams()` as needed to format the params needed by the `describeList()` method in a `VingRecord`
 * @param {Object} event an `h3` event
 * @param {Object} session Optional, a Ving session instance
 * @returns An object containing the describeList params
 */
export const describeListParams = (event, session) => {
    return { ...pagingParams(event), objectParams: { currentUser: session || obtainSession(event), include: includeParams(event) } };
}

export const pagingParams = (event) => {
    const params = getQuery(event);
    const paging = { itemsPerPage: 10, page: 1, sortBy: ['createdAt'], sortOrder: 'asc' };
    if (!isUndefined(params)) {
        if (params.itemsPerPage)
            paging.itemsPerPage = Number(params.itemsPerPage);
        if (params.page)
            paging.page = Number(params.page);
        if (params.sortBy && isString(params.sortBy))
            paging.sortBy = [params.sortBy];
        if (params.sortBy && isArray(params.sortBy))
            paging.sortBy = params.sortBy;
        if (params.sortOrder && isString(params.sortOrder) && ['asc', 'desc'].includes(params.sortOrder))
            paging.sortOrder = params.sortOrder;
    }
    return paging;
}

/**
 * Gets the body from the `h3` event, makes sure it is formatted like an object and returns it.
 * @param {Object} event an `h3` event
 * @throws 400 if body is malformed
 * @returns an `h3` body object
 */
export const getBody = async (event) => {
    const body = await readBody(event);
    if (isUndefined(body) || (body && isObject(body)))
        return body;
    throw ouch(400, 'Malformed body JSON. Perhaps you have a dangling comma.');
}