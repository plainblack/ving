import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, InferModel } from 'drizzle-orm/mysql-core';

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