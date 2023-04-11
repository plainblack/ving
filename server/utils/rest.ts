import { MySql2Database, like, eq, asc, desc, and, or, ne, SQL, sql, Name, AnyMySqlColumn } from '../../server/drizzle/orm';
import { H3Event, getQuery, readBody } from 'h3';
import { QueryFilter } from '../../types';

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