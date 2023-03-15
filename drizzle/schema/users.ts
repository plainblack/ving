import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, InferModel } from 'drizzle-orm/mysql-core';
import { v4 } from 'uuid';
import { z } from 'zod';

export const stringDefault = (prop: vingProp) => {
    if (typeof prop.default == 'string')
        return prop.default;
    if (typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'string')
            return value;
    }
    return '';
}

export const numberDefault = (prop: vingProp) => {
    if (typeof prop.default == 'number')
        return prop.default;
    if (typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'number')
            return value;
    }
    return 0;
}

export const lengthDefault = (prop: vingProp) => {
    if (typeof prop.length == 'number')
        return { length: prop.length };
    return { length: 256 };
}

export const booleanDefault = (prop: vingProp) => {
    if (typeof prop.default == 'boolean')
        return prop.default;
    if (typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'boolean')
            return value;
    }
    return false;
}

export const zodString = (prop: vingProp) => {
    return z.string().min(1).max(prop.length || 256)
}

export type vingProp = {
    name: string,
    //    name: keyof ModelProps<T>,
    length?: number,
    default: boolean | string | number | Date | undefined | (() => boolean | string | number | Date),
    db: (prop: vingProp) => any,
    zod?: (prop: vingProp) => any,
    required: boolean,
    relation?: {
        type: '1:n' | 'n:1' | 'n:n' | '1:1',
        name: string,
    },
    unique?: boolean,
    enums?: readonly string[] | readonly boolean[],
    enumLabels?: string[],
    view: string[],
    edit: string[],
    noSetAll?: boolean,
}

export type vingSchema = {
    kind: string,
    owner: string[]
    props: vingProp[],
}

export type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};

export const userSchema: vingSchema = {
    kind: 'User',
    owner: ['$id', 'admin'],
    props: [
        {
            name: "id",
            required: true,
            length: 36,
            default: () => v4(),
            db: (prop: vingProp) => varchar(prop.name, lengthDefault(prop)).primaryKey(),
            view: ['public'],
            edit: [],
        },
        {
            name: "createdAt",
            required: true,
            default: () => new Date(),
            db: (prop: vingProp) => timestamp(prop.name).defaultNow().notNull(),
            view: ['public'],
            edit: [],
        },
        {
            name: "updatedAt",
            required: true,
            default: () => new Date(),
            db: (prop: vingProp) => timestamp(prop.name).defaultNow().notNull(),
            view: ['public'],
            edit: [],
        },
        {
            name: "username",
            required: true,
            unique: true,
            length: 60,
            default: '',
            db: (prop: vingProp) => varchar(prop.name, lengthDefault(prop)).notNull().default(stringDefault(prop)),
            zod: (prop: vingProp) => z.string().min(1).max(prop.length || 256),
            view: [],
            edit: ['owner'],
        },
        {
            name: "email",
            required: true,
            unique: true,
            default: '',
            db: (prop: vingProp) => varchar(prop.name, lengthDefault(prop)).notNull().default(stringDefault(prop)),
            zod: (prop: vingProp) => z.string().min(1).max(prop.length || 256).email(),
            view: [],
            edit: ['owner'],
        },
        {
            name: "realName",
            required: true,
            length: 60,
            default: '',
            db: (prop: vingProp) => varchar(prop.name, lengthDefault(prop)).notNull().default(stringDefault(prop)),
            zod: (prop: vingProp) => z.string().min(1).max(prop.length || 256),
            view: [],
            edit: ['owner'],
        },
        {
            name: "password",
            required: false,
            default: 'no-password-specified',
            db: (prop: vingProp) => varchar(prop.name, lengthDefault(prop)).notNull().default(stringDefault(prop)),
            enums: ['bcrypt'],
            enumLabels: ['Bcrypt'],
            view: [],
            edit: [],
        },
        {
            name: 'useAsDisplayName',
            required: true,
            length: 20,
            default: 'username',
            db: (prop: vingProp) => varchar(prop.name, lengthDefault(prop)).notNull().default(stringDefault(prop)),
            enums: ['username', 'email', 'realName'],
            enumLabels: ['Username', 'Email Address', 'Real Name'],
            view: [],
            edit: ['owner'],
        },
        {
            name: 'admin',
            required: true,
            default: false,
            db: (prop: vingProp) => boolean(prop.name).notNull().default(booleanDefault(prop)),
            enums: [false, true],
            enumLabels: ['Not Admin', 'Admin'],
            view: ['owner'],
            edit: ['admin'],
        },
        {
            name: 'developer',
            required: true,
            default: false,
            db: (prop: vingProp) => boolean(prop.name).notNull().default(booleanDefault(prop)),
            enums: [false, true],
            enumLabels: ['Not a Software Developer', 'Software Developer'],
            view: [],
            edit: ['owner'],
        },
    ],
};

export const makeTable = (schema: vingSchema) => {
    const fields: Record<string, any> = {};
    const uniqueIndexes: Record<string, any> = {};
    for (const prop of schema.props) {
        fields[prop.name] = prop.db(prop);
        if (prop.unique) {
            const key = prop.name + 'Index';
            uniqueIndexes[key] = (table: Record<string, any>, field: vingProp) => uniqueIndex(key).on(table[field.name]);
        }
    }
    const extras = (table: Record<string, any>) => {
        const out: Record<string, any> = {};
        for (const key in uniqueIndexes) {
            out[key] = uniqueIndexes[key](table);
        }
        return out;
    }
    return mysqlTable(schema.kind.toLowerCase(), fields, extras)
}

export const users = mysqlTable('users',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        createdAt: timestamp('createdAt').defaultNow().notNull(),
        updatedAt: timestamp('updatedAt').defaultNow().notNull(),
        username: varchar('username', { length: 60 }).notNull(),
        email: varchar('email', { length: 256 }).notNull(),
        realName: varchar('realName', { length: 60 }).notNull(),
        password: varchar('password', { length: 256 }).notNull().default('no-password-specified'),
        passwordType: mysqlEnum('passwordType', ['bcrypt']).default('bcrypt').notNull(),
        useAsDisplayName: mysqlEnum('useAsDisplayName', ['username', 'email', 'realName']).default('username').notNull(),
        admin: boolean('admin').notNull().default(false),
        developer: boolean('developer').notNull().default(false),
    },
    (users) => ({
        usernameIndex: uniqueIndex('usernameIndex').on(users.username),
        emailIndex: uniqueIndex('emailIndex').on(users.email),
    })
);

export type User = InferModel<typeof users>; // return type when queried
export type NewUser = InferModel<typeof users, 'insert'>; // insert type