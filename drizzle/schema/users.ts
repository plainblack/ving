import { AnyMySqlColumn, MySqlColumn, AnyMySqlTable, boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, InferModel } from 'drizzle-orm/mysql-core';
import { AnyMySqlColumnBuilder } from 'drizzle-orm/mysql-core/columns/common';

import { v4 } from 'uuid';
import { z, ZodTypeAny } from 'zod';

export const stringDefault = (prop: vingProp): string => {
    if (typeof prop.default == 'string')
        return prop.default;
    if (typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'string')
            return value;
    }
    return '';
}

export const numberDefault = (prop: vingProp): number => {
    if (typeof prop.default == 'number')
        return prop.default;
    if (typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'number')
            return value;
    }
    return 0;
}

export const dbColLength = (prop: vingProp): { length: number } => {
    if (typeof prop.length == 'number')
        return { length: prop.length };
    return { length: 256 };
}

export const booleanDefault = (prop: vingProp): boolean => {
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
    return z.string().min(1).max(prop.length || 256);
}

export const dbTimestamp = (prop: vingProp) => {
    return timestamp(prop.name).defaultNow().notNull();
}

export const dbString = (prop: vingProp) => {
    return varchar(prop.name, dbColLength(prop)).notNull().default(stringDefault(prop));
}

export const dbEnum = (prop: vingProp) => {
    return mysqlEnum(prop.name, prop.enums || ['']).notNull().default(stringDefault(prop));
}

export const dbBoolean = (prop: vingProp) => {
    return boolean(prop.name).notNull().default(booleanDefault(prop));
}

export const dbPk = (prop: vingProp) => {
    return varchar(prop.name, dbColLength(prop)).primaryKey();
}


export type vingProp = {
    name: string,
    //    name: keyof ModelProps<T>,
    length?: number,
    default: boolean | string | number | Date | undefined | (() => boolean | string | number | Date),
    db: (prop: vingProp) => AnyMySqlColumnBuilder,
    zod?: (prop: vingProp) => ZodTypeAny,
    required: boolean,
    relation?: {
        type: '1:n' | 'n:1' | 'n:n' | '1:1',
        name: string,
    },
    unique?: boolean,
    enums?: [string, ...string[]],
    enumLabels?: [string, ...string[]],
    view: string[],
    edit: string[],
    noSetAll?: boolean,
}

export type vingSchema = {
    kind: string,
    tableName: string,
    owner: string[]
    props: vingProp[],
}

export type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};

export const userSchema: vingSchema = {
    kind: 'User',
    tableName: 'users',
    owner: ['$id', 'admin'],
    props: [
        {
            name: "id",
            required: true,
            length: 36,
            default: () => v4(),
            db: (prop: vingProp) => dbPk(prop),
            view: ['public'],
            edit: [],
        },
        {
            name: "createdAt",
            required: true,
            default: () => new Date(),
            db: (prop: vingProp) => dbTimestamp(prop),
            view: ['public'],
            edit: [],
        },
        {
            name: "updatedAt",
            required: true,
            default: () => new Date(),
            db: (prop: vingProp) => dbTimestamp(prop),
            view: ['public'],
            edit: [],
        },
        {
            name: "username",
            required: true,
            unique: true,
            length: 60,
            default: '',
            db: (prop: vingProp) => dbString(prop),
            zod: (prop: vingProp) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            name: "email",
            required: true,
            unique: true,
            default: '',
            db: (prop: vingProp) => dbString(prop),
            zod: (prop: vingProp) => zodString(prop).email(),
            view: [],
            edit: ['owner'],
        },
        {
            name: "realName",
            required: true,
            length: 60,
            default: '',
            db: (prop: vingProp) => dbString(prop),
            zod: (prop: vingProp) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            name: "password",
            required: false,
            default: 'no-password-specified',
            db: (prop: vingProp) => dbString(prop),
            enums: ['bcrypt'],
            enumLabels: ['Bcrypt'],
            view: [],
            edit: [],
        },
        {
            name: "passwordType",
            required: false,
            default: 'bcrypt',
            db: (prop: vingProp) => dbEnum(prop),
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
            db: (prop: vingProp) => dbEnum(prop),
            enums: ['username', 'email', 'realName'],
            enumLabels: ['Username', 'Email Address', 'Real Name'],
            view: [],
            edit: ['owner'],
        },
        {
            name: 'admin',
            required: true,
            default: false,
            db: (prop: vingProp) => dbBoolean(prop),
            enumLabels: ['Not Admin', 'Admin'],
            view: ['owner'],
            edit: ['admin'],
        },
        {
            name: 'developer',
            required: true,
            default: false,
            db: (prop: vingProp) => dbBoolean(prop),
            enumLabels: ['Not a Software Developer', 'Software Developer'],
            view: [],
            edit: ['owner'],
        },
    ],
};

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

export const users = makeTable(userSchema);

/*
export const users = mysqlTable('users',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        createdAt: timestamp('createdAt').defaultNow().notNull(),
        updatedAt: timestamp('updatedAt').defaultNow().notNull(),
        username: varchar('username', { length: 60 }).notNull().default(''),
        email: varchar('email', { length: 256 }).notNull().default(''),
        realName: varchar('realName', { length: 60 }).notNull().default(''),
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
*/

export type User = InferModel<typeof users>; // return type when queried
export type NewUser = InferModel<typeof users, 'insert'>; // insert type