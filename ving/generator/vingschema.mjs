import { getContext, renderTemplate, toFile, after, inject } from '@featherscloud/pinion';

const schemaTemplate = ({ name }) =>
    `import { baseSchemaProps, dbString, zodString, dbEnum, dbBoolean, dbText, zodText, dbRelation, dbDateTime, dbTimestamp, dbInt, dbJson, zodNumber, zodJsonObject } from '../helpers.mjs';

export const ${name.toLowerCase()}Schema = {
    kind: '${name}',
    tableName: '${name.toLowerCase()}s',
    owner: ['$userId', 'admin'],
    props: [
        ...baseSchemaProps,
        // unique email field
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
        // url field
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
        // varchar field
        {
            type: "string",
            name: "someShortText",
            required: true,
            length: 60,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        // text blob field
        {
            type: "string",
            name: 'someLongText',
            required: false,
            length: 65535,
            default: '',
            db: (prop) => dbText(prop),
            zod: (prop) => zodText(prop),
            view: [],
            edit: ['owner'],
        },
        // enumeration field
        {
            type: "enum",
            name: 'size',
            required: true,
            length: 20,
            default: 'medium',
            db: (prop) => dbEnum(prop),
            enums: ['small', 'medium', 'large'],
            enumLabels: ['Small', 'Medium', 'Large'],
            view: [],
            edit: ['owner'],
        },
        // integer field
        {
            type: "int",
            name: "sizeInBytes",
            required: false,
            default: 0,
            db: (prop) => dbInt(prop),
            zod: (prop) => zodNumber(prop).positive(),
            view: ['public'],
            edit: [],
        },
        // json field
        {
            type: "json",
            name: "metadata",
            required: false,
            default: '{}',
            db: (prop) => dbJson(prop),
            zod: (prop) => zodJsonObject(prop).passthrough(), // or replace .passthrough() with something like .extends({foo: z.string()})
            view: ['public'],
            edit: [],
        },
        // boolean field
        {
            type: "boolean",
            name: 'isCool',
            required: true,
            default: false,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Not Cool', 'Very Cool'],
            view: [],
            edit: ['owner'],
        },
        // 1:N relationship - aka a relationship to my children
       /* {
            type: "virtual",
            name: '${name.toLowerCase()}Id', // the name of this record's id in the remote table
            required: false,
            view: ['public'],
            edit: [],
            relation: {
                type: 'child',
                name: '${name.toLowerCase()}comments',
                kind: '${name}Comment',
            },
        },*/
        // N:1 relationship - aka a relationship to my parent
        /*{
            type: "id",
            name: '${name.toLowerCase()}GroupId', // the name of the remote record's id in this table
            required: true,
            length: 36,
            db: (prop) => dbRelation(prop),
            relation: {
                type: 'parent',
                name: '${name.toLowerCase()}group',
                kind: '${name}Group',
            },
            default: undefined,
            view: ['public'],
            edit: ['owner'],
        },*/
        // a user relationship
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
            edit: ['owner'],
        },
        // date field
        {
            type: "date",
            name: "startedAt",
            required: true,
            default: () => new Date(),
            db: (prop) => dbDateTime(prop),
            view: ['public'],
            edit: [],
        },
    ],
};`;

export const generateSchema = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(schemaTemplate(context), toFile(`ving/schema/schemas/${context.name}.mjs`)))
        .then(inject(`import { ${context.name.toLowerCase()}Schema } from "#ving/schema/schemas/${context.name}.mjs";`, after('import { apikeySchema } from "#ving/schema/schemas/APIKey.mjs";'), toFile('ving/schema/map.mjs')))
        .then(inject(`    ${context.name.toLowerCase()}Schema,`, after('    apikeySchema,'), toFile('ving/schema/map.mjs')));
}