export { drizzle } from 'drizzle-orm/mysql2';
export { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text, datetime, int, json, customType } from 'drizzle-orm/mysql-core';
export { like, eq, asc, desc, and, or, ne, gt, gte, lt, lte, inArray, getTableName } from 'drizzle-orm';
export { sql } from 'drizzle-orm/sql';

/**
 * Generates a `mediumtext` MySQL field through the Drizzle types system.
 */

export const mediumText = customType({
    dataType() {
        return 'mediumtext';
    },
});