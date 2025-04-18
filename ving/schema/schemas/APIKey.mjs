import { baseSchemaId, baseSchemaCreatedAt, baseSchemaUpdatedAt, dbVarChar, zodString, dbText, dbRelation } from '../helpers.mjs';
import crypto from 'crypto';

export const apikeySchema = {
    kind: 'APIKey',
    tableName: 'apikeys',
    owner: ['$userId', 'admin'],
    props: [
        { ...baseSchemaId },
        { ...baseSchemaCreatedAt },
        { ...baseSchemaUpdatedAt },
        {
            type: "string",
            name: 'name',
            filterQuery: true,
            required: true,
            length: 60,
            db: (prop) => dbVarChar(prop),
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
            zod: (prop) => zodString(prop).url(),
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
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: 'privateKey',
            required: false,
            length: 39,
            default: () => 'pk_' + crypto.randomBytes(18).toString('hex'),
            db: (prop) => dbVarChar(prop),
            view: ['owner'],
            edit: [],
        },
        {
            type: "id",
            name: 'userId',
            required: true,
            db: (prop) => dbRelation(prop),
            relation: {
                type: 'parent',
                name: 'user',
                kind: 'User',
            },
            default: undefined,
            view: ['public'],
            edit: ['owner'],
        },
    ],
};