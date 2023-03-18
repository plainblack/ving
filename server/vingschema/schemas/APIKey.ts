import { vingSchema } from '../../../types/vingschema';
import { uuid, baseSchemaProps, dbString, zodString, dbText, zodText, dbRelation } from '../helpers';

export const apikeySchema: vingSchema = {
    kind: 'APIKey',
    tableName: 'apikeys',
    owner: ['$id', 'admin'],
    props: [
        ...baseSchemaProps,
        {
            type: "string",
            name: 'name',
            required: true,
            length: 60,
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            default: '',
            view: ['public'],
            edit: ['owner'],
        },
        {
            type: "string",
            name: 'url',
            length: 65535,
            required: true,
            db: (prop) => dbText(prop),
            zod: (prop) => zodText(prop).url(),
            default: '',
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: 'reason',
            required: false,
            length: 65535,
            default: '',
            db: (prop) => dbText(prop),
            zod: (prop) => zodText(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: 'privateKey',
            required: false,
            length: 39,
            default: () => 'pk_' + uuid(),
            db: (prop) => dbString(prop),
            view: [],
            edit: [],
        },
        {
            type: "id",
            name: 'userId',
            required: true,
            length: 36,
            db: (prop) => dbRelation(prop),
            relation: {
                type: 'parent',
                name: 'user',
                kind: 'User',
            },
            default: undefined,
            view: ['public'],
            edit: [],
        },
    ],
};
/*
export const APIKeyTable = makeTable(apikeySchema);

export type APIKeyModel = typeof APIKeyTable;


// temporary measure until we can get the types worked out for auto-generation
import { mysqlTable, varchar, timestamp, text } from 'drizzle-orm/mysql-core';
export const apikeysTemp = mysqlTable('apikeys',
    {
        id: varchar('id', { length: 36 }).primaryKey(),
        createdAt: timestamp('createdAt').defaultNow().notNull(),
        updatedAt: timestamp('updatedAt').defaultNow().notNull(),
        name: varchar('name', { length: 60 }).notNull(),
        url: varchar('url', { length: 256 }).notNull().default(''),
        reason: text('reason').notNull().default(''),
        privateKey: varchar('privateKey', { length: 36 }).notNull(),
        userId: varchar('userId', { length: 36 }).notNull().references(() => UserTable.id),
    },
);
export type APIKeySelect = InferModel<typeof apikeysTemp, 'select'>; // return type when queried
export type APIKeyInsert = InferModel<typeof apikeysTemp, 'insert'>; // insert type
export type APIKeyProps = {
    id: string,
    createdAt: Date,
    updatedAt: Date,
    name: string,
    url: string,
    privateKey: string,
    userId: string,
}
*/