import { vingSchema } from '../../../types/vingschema';
import { baseSchemaProps, dbString, zodString, dbEnum, dbBoolean } from '../helpers';

export const userSchema: vingSchema = {
    kind: 'User',
    tableName: 'users',
    owner: ['$id', 'admin'],
    props: [
        ...baseSchemaProps,
        {
            type: "string",
            name: "username",
            required: true,
            unique: true,
            length: 60,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: "email",
            required: true,
            unique: true,
            length: 256,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop).email(),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: "realName",
            required: true,
            length: 60,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: "password",
            length: 256,
            required: false,
            default: 'no-password-specified',
            db: (prop) => dbString(prop),
            view: [],
            edit: [],
        },
        {
            type: "enum",
            name: "passwordType",
            required: false,
            length: 20,
            default: 'bcrypt',
            db: (prop) => dbEnum(prop),
            enums: ['bcrypt'],
            enumLabels: ['Bcrypt'],
            view: [],
            edit: [],
        },
        {
            type: "enum",
            name: 'useAsDisplayName',
            required: true,
            length: 20,
            default: 'username',
            db: (prop) => dbEnum(prop),
            enums: ['username', 'email', 'realName'],
            enumLabels: ['Username', 'Email Address', 'Real Name'],
            view: [],
            edit: ['owner'],
        },
        {
            type: "boolean",
            name: 'verifiedEmail',
            required: true,
            default: false,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Verified', 'Not Yet Verified'],
            view: ['owner'],
            edit: ['admin'],
        },
        {
            type: "boolean",
            name: 'admin',
            required: true,
            default: false,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Not Admin', 'Admin'],
            view: ['owner'],
            edit: ['admin'],
        },
        {
            type: "boolean",
            name: 'developer',
            required: true,
            default: false,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Not a Software Developer', 'Software Developer'],
            view: [],
            edit: ['owner'],
        },
        {
            type: "virtual",
            name: 'apikeys',
            required: false,
            view: ['public'],
            edit: [],
            relation: {
                type: 'child',
                name: 'apikeys',
                kind: 'APIKey',
            },
        },
    ],
};

export const RoleOptions = ["admin", "developer"] as const;

/*
export const UserTable = makeTable(userSchema);

// temporary measure until we can get the types worked out for auto-generation
import { mysqlTable, varchar, timestamp, mysqlEnum, boolean, uniqueIndex } from 'drizzle-orm/mysql-core';
export const usersTemp = mysqlTable('users',
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



export type UserModel = typeof UserTable;
export type UserSelect = InferModel<typeof usersTemp, 'select'>
export type UserInsert = InferModel<typeof usersTemp, 'insert'>


//export type User = InferModel<UserModel>; // return type when queried

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false
type Expect<T extends true> = T

type test = Expect<Equal<UserSelect, UserProps>>

// have to do this until infererence works
export type UserProps = {
    id: string,
    createdAt: Date,
    updatedAt: Date,
    username: string,
    email: string,
    realName: string,
    password: string,
    passwordType: 'bcrypt',
    useAsDisplayName: 'username' | 'email' | 'realName',
    admin: boolean,
    developer: boolean
}
*/