import { baseSchemaProps, dbVarChar, zodString, dbBoolean, dbText, dbJson, zodJsonObject } from '../helpers.mjs';

export const cronJobSchema = {
    kind: 'CronJob',
    tableName: 'cronjobs',
    owner: ['admin'],
    props: [
        ...baseSchemaProps,
        {
            type: "string",
            name: "schedule",
            required: true,
            unique: false,
            length: 60,
            default: '* * * * *',
            filterQualifier: true,
            db: (prop) => dbVarChar(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "string", // could be an enum, but it would be annoying updating it every time one was added or removed
            name: "handler",
            options: 'handlerOptions',
            required: true,
            unique: false,
            length: 60,
            default: 'Test',
            filterQualifier: true,
            db: (prop) => dbVarChar(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        {
            type: "json",
            name: "params",
            required: false,
            default: '{}',
            db: (prop) => dbJson(prop),
            zod: (prop) => zodJsonObject(prop).passthrough(), // or replace .passthrough() with something like .extends({foo: z.string()})
            view: [],
            edit: ['owner'],
        },
        {
            type: "boolean",
            name: 'enabled',
            required: true,
            default: true,
            filterQualifier: true,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Not Enabled', 'Is Enabled'],
            view: [],
            edit: ['owner'],
        },
        {
            type: "string",
            name: 'note',
            required: false,
            length: 65535,
            default: '',
            db: (prop) => dbText(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
    ],
};