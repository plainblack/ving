import { vingSchema, vingProp } from '../../types/db';
import { uuid, baseSchemaProps, dbString, zodString, makeTable, dbText, zodText, dbId } from '../helpers';
import { InferModel } from 'drizzle-orm/mysql-core';
import { users } from './users';
/*
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
*/

export const apikeySchema: vingSchema = {
    kind: 'APIKey',
    tableName: 'apikeys',
    owner: ['$id', 'admin'],
    props: [
        ...baseSchemaProps,
        {
            name: 'name',
            required: true,
            length: 60,
            db: (prop: vingProp) => dbString(prop),
            zod: (prop: vingProp) => zodString(prop),
            default: '',
            view: ['public'],
            edit: ['owner'],
        },
        {
            name: 'url',
            required: true,
            db: (prop: vingProp) => dbText(prop),
            zod: (prop: vingProp) => zodText(prop).url(),
            default: '',
            view: [],
            edit: ['owner'],
        },
        {
            name: 'reason',
            required: false,
            default: '',
            db: (prop: vingProp) => dbText(prop),
            zod: (prop: vingProp) => zodText(prop),
            view: [],
            edit: ['owner'],
        },
        {
            name: 'privateKey',
            required: false,
            length: 39,
            default: () => 'pk_' + uuid(),
            db: (prop: vingProp) => dbString(prop),
            view: [],
            edit: [],
        },
        {
            name: 'userId',
            required: true,
            db: (prop: vingProp) => dbId(prop).references(() => users.id),
            relation: {
                type: '1:n',
                name: 'user',
            },
            default: undefined,
            view: ['public'],
            edit: [],
        },
    ],
};

export const apikeys = makeTable(apikeySchema);

//export type APIKey = InferModel<typeof apikeys>; // return type when queried
//export type NewAPIKey = InferModel<typeof apikeys, 'insert'>; // insert type
export type APIKey = {
    id: string,
    createdAt: Date,
    updatedAt: Date,
    name: string,
    url: string,
    privateKey: string,
    userId: string,
}