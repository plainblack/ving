import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text, AnyMySqlColumnBuilder, AnyMySqlColumn } from '~/server/drizzle/orm';
import { vingSchema, vingProp } from '../../types/vingschema';
import { v4 } from 'uuid';
import { z } from 'zod';
export const uuid = v4;
import * as fs from 'fs';
import * as path from 'path';

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
    return `timestamp('${prop.name}').defaultNow().notNull()` + (prop.autoUpdate ? '.onUpdateNow()' : '');
}

export const dbString = (prop: Extract<vingProp, { type: "string" }>) => {
    return `varchar('${prop.name}', { length: ${prop.length} }).notNull().default('${stringDefault(prop, true)}')`;
}

export const dbText = (prop: Extract<vingProp, { type: "string" }>) => {
    return `text('${prop.name}').notNull()`;
}

export const dbEnum = (prop: Extract<vingProp, { type: "enum" }>) => {
    return `mysqlEnum('${prop.name}', ['${prop.enums.join("','")}']).notNull().default('${stringDefault(prop, true)}')`;
}

export const dbBoolean = (prop: Extract<vingProp, { type: "boolean" }>) => {
    return `boolean('${prop.name}').notNull().default(${booleanDefault(prop, true)})`;
}

export const dbId = (prop: Extract<vingProp, { type: "id" }>) => {
    let col = `varchar('${prop.name}', { length: 36 })`;
    if (prop.required) {
        col += `.notNull()`;
    }
    return col;
}

export const dbPk = (prop: Extract<vingProp, { type: "id" }>) => {
    return `${dbId(prop)}.default('uuid-will-be-generated').primaryKey()`;
}

export const dbRelation = (prop: Extract<vingProp, { type: "id" }>) => {
    return `${dbId(prop)}.references(() => ${prop.relation?.kind}Table.id)`;
}

export const writeFileSafely = async (writeLocation: string, content: any) => {
    fs.mkdirSync(path.dirname(writeLocation), {
        recursive: true,
    })

    fs.writeFileSync(writeLocation, content)
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
        filterRange: true,
        required: true,
        default: () => new Date(),
        db: (prop) => dbTimestamp(prop),
        view: ['public'],
        edit: [],
    },
    {
        type: "date",
        name: "updatedAt",
        filterRange: true,
        required: true,
        autoUpdate: true,
        default: () => new Date(),
        db: (prop) => dbTimestamp(prop),
        view: ['public'],
        edit: [],
    },
];
