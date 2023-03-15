import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text } from 'drizzle-orm/mysql-core';
import type { AnyMySqlColumn } from 'drizzle-orm/mysql-core';
import { AnyMySqlColumnBuilder } from 'drizzle-orm/mysql-core/columns/common';
import { vingSchema, vingProp } from '../types/db';
export { v4 as uuid } from 'uuid';
import { z } from 'zod';

export const dbColLength = (prop: vingProp): { length: number } => {
    if (typeof prop.length == 'number')
        return { length: prop.length };
    return { length: 256 };
}

export const stringDefault = (prop: vingProp, skipFunc: boolean = false): string => {
    if (typeof prop.default == 'string')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'string')
            return value;
    }
    return '';
}

export const numberDefault = (prop: vingProp, skipFunc: boolean = false): number => {
    if (typeof prop.default == 'number')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'number')
            return value;
    }
    return 0;
}

export const booleanDefault = (prop: vingProp, skipFunc: boolean = false): boolean => {
    if (typeof prop.default == 'boolean')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'boolean')
            return value;
    }
    return false;
}

export const zodString = (prop: vingProp) => {
    return z.string().min(1).max(prop.length || 256);
}

export const zodText = (prop: vingProp) => {
    return z.string().min(1).max(prop.length || 65535);
}

export const dbTimestamp = (prop: vingProp) => {
    return timestamp(prop.name).defaultNow().notNull();
}

export const dbString = (prop: vingProp) => {
    return varchar(prop.name, dbColLength(prop)).notNull().default(stringDefault(prop, true));
}

export const dbText = (prop: vingProp) => {
    return text(prop.name).notNull();
}

export const dbEnum = (prop: vingProp) => {
    return mysqlEnum(prop.name, prop.enums || ['']).notNull().default(stringDefault(prop, true));
}

export const dbBoolean = (prop: vingProp) => {
    return boolean(prop.name).notNull().default(booleanDefault(prop, true));
}

export const dbId = (prop: vingProp) => {
    const col = varchar(prop.name, { length: 36 });
    if (prop.required) {
        return col.notNull();
    }
    return col;
}

export const dbPk = (prop: vingProp) => {
    return dbId(prop).primaryKey();
}

// somehow have to use inference to make it so this casts the right types: https://discord.com/channels/1043890932593987624/1085675996956590162
// see this as an example: https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/mysql-core/table.ts#L184
export const makeTable = (schema: vingSchema) => {
    const columns: Record<string, AnyMySqlColumnBuilder> = {};
    const uniqueIndexes: Record<string, any> = {};
    for (const prop of schema.props) {
        columns[prop.name] = prop.db(prop);
        if (prop.unique) {
            const key = prop.name + 'Index';
            uniqueIndexes[key] = (table: Record<string, AnyMySqlColumn>) => uniqueIndex(key).on(table[prop.name]);
        }
    }
    const extras = (table: Record<string, any>) => {
        const out: Record<string, any> = {};
        for (const key in uniqueIndexes) {
            out[key] = uniqueIndexes[key](table);
        }
        return out;
    }
    return mysqlTable(schema.tableName, columns, extras)
}