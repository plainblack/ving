import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text } from 'drizzle-orm/mysql-core';
import type { AnyMySqlColumn } from 'drizzle-orm/mysql-core';
import { AnyMySqlColumnBuilder } from 'drizzle-orm/mysql-core/columns/common';
import { vingSchema, vingProp } from '../types/db';
import { v4 } from 'uuid';
import { z } from 'zod';
export const uuid = v4;

export const stringDefault = (prop: Extract<vingProp, { type: "string" | "enum" | "id" }>, skipFunc: boolean = false): string => {
    if (typeof prop.default == 'string')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'string')
            return value;
    }
    return '';
}

export const numberDefault = (prop: Extract<vingProp, { type: "number" }>, skipFunc: boolean = false): number => {
    if (typeof prop.default == 'number')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'number')
            return value;
    }
    return 0;
}

export const booleanDefault = (prop: Extract<vingProp, { type: "boolean" }>, skipFunc: boolean = false): boolean => {
    if (typeof prop.default == 'boolean')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'boolean')
            return value;
    }
    return false;
}

export const dateDefault = (prop: Extract<vingProp, { type: "date" }>, skipFunc: boolean = false): Date => {
    if (prop.default instanceof Date)
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (value instanceof Date)
            return value;
    }
    return new Date();
}

export const zodString = (prop: Extract<vingProp, { type: "string" }>) => {
    return z.string().min(1).max(prop.length);
}

export const zodText = (prop: Extract<vingProp, { type: "string" }>) => {
    return z.string().min(1).max(prop.length);
}

export const dbTimestamp = (prop: Extract<vingProp, { type: "date" }>) => {
    return timestamp(prop.name).defaultNow().notNull();
}

export const dbString = (prop: Extract<vingProp, { type: "string" }>) => {
    return varchar(prop.name, { length: prop.length }).notNull().default(stringDefault(prop, true));
}

export const dbText = (prop: Extract<vingProp, { type: "string" }>) => {
    return text(prop.name).notNull();
}

export const dbEnum = (prop: Extract<vingProp, { type: "enum" }>) => {
    return mysqlEnum(prop.name, prop.enums || ['']).notNull().default(stringDefault(prop, true));
}

export const dbBoolean = (prop: Extract<vingProp, { type: "boolean" }>) => {
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
        columns[prop.name] = prop.db(prop as never);
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

export const baseSchemaProps: vingProp[] = [
    {
        type: "id",
        name: "id",
        required: true,
        length: 36,
        default: () => uuid(),
        db: (prop) => dbPk(prop),
        view: ['public'],
        edit: [],
    },
    {
        type: "date",
        name: "createdAt",
        required: true,
        default: () => new Date(),
        db: (prop) => dbTimestamp(prop),
        view: ['public'],
        edit: [],
    },
    {
        type: "date",
        name: "updatedAt",
        required: true,
        default: () => new Date(),
        db: (prop) => dbTimestamp(prop),
        view: ['public'],
        edit: [],
    },
];
