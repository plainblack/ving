import { foreignKey, mysqlTable, timestamp, text, varchar, InferModel } from 'drizzle-orm/mysql-core';
import { users } from './users';

export const apikeys = mysqlTable('apikeys',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        createdAt: timestamp('createdAt').defaultNow().notNull(),
        updatedAt: timestamp('updatedAt').defaultNow().notNull(),
        name: varchar('name', { length: 60 }).notNull(),
        url: varchar('url', { length: 256 }).notNull().default(''),
        reason: text('reason').notNull().default(''),
        privateKey: varchar('privateKey', { length: 36 }).notNull(),
        userId: varchar('userId', { length: 36 }).notNull().references(() => users.id),
    },
);

export type APIKey = InferModel<typeof apikeys>; // return type when queried
export type NewAPIKey = InferModel<typeof apikeys, 'insert'>; // insert type