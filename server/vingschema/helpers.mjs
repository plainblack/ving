import { v4 } from 'uuid';
import { z } from 'zod';
export const uuid = v4;

export const stringDefault = (prop, skipFunc = false) => {
    if (typeof prop.default == 'string')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'string')
            return value;
    }
    return '';
}

export const numberDefault = (prop, skipFunc = false) => {
    if (typeof prop.default == 'number')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'number')
            return value;
    }
    return 0;
}

export const booleanDefault = (prop, skipFunc = false) => {
    if (typeof prop.default == 'boolean')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'boolean')
            return value;
    }
    return false;
}

export const dateDefault = (prop, skipFunc = false) => {
    if (prop.default instanceof Date)
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (value instanceof Date)
            return value;
    }
    return new Date();
}

export const zodString = (prop) => {
    return z.string().min(1).max(prop.length);
}

export const zodNumber = (prop) => {
    return z.number();
}

export const zodJsonObject = (prop) => {
    return zodString(prop).startsWith('{').endsWith('}').or(z.object());
}

export const zodText = (prop) => {
    return z.string().min(1).max(prop.length);
}

export const dbTimestamp = (prop) => {
    return `timestamp('${prop.name}').defaultNow().notNull()` + (prop.autoUpdate ? '.onUpdateNow()' : '');
}

export const dbDateTime = (prop) => {
    return `datetime('${prop.name}').default('1000-01-01 00:00:00').notNull()` + (prop.autoUpdate ? '.onUpdateNow()' : '');
}

export const dbString = (prop) => {
    return `varchar('${prop.name}', { length: ${prop.length} }).notNull().default('${stringDefault(prop, true)}')`;
}

export const dbText = (prop) => {
    return `text('${prop.name}').notNull()`;
}

export const dbEnum = (prop) => {
    return `mysqlEnum('${prop.name}', ['${prop.enums.join("','")}']).notNull().default('${stringDefault(prop, true)}')`;
}

export const dbBoolean = (prop) => {
    return `boolean('${prop.name}').notNull().default(${booleanDefault(prop, true)})`;
}

export const dbInt = (prop) => {
    return `int('${prop.name}').notNull().default(${numberDefault(prop, true)})`;
}

export const dbJson = (prop) => {
    return `json('${prop.name}').notNull().default(${stringDefault(prop, true)})`;
}

export const dbId = (prop) => {
    let col = `varchar('${prop.name}', { length: 36 })`;
    if (prop.required) {
        col += `.notNull()`;
    }
    return col;
}

export const dbPk = (prop) => {
    return `${dbId(prop)}.default('uuid-will-be-generated').primaryKey()`;
}

export const dbRelation = (prop) => {
    return `${dbId(prop)}.references(() => ${prop.relation?.kind}Table.id, {onDelete: ${prop.required ? '"cascade"' : '"set null"'}, onUpdate: ${prop.required ? '"cascade"' : '"no action"'}})`;
}

export const baseSchemaProps = [
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
