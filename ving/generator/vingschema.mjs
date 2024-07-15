import { getContext, renderTemplate, toFile, after, inject } from '@featherscloud/pinion';
import { camelCase } from 'scule';

const schemaTemplate = ({ name }) =>
    `import { baseSchemaProps, dbVarChar, zodString, dbEnum, dbBoolean, dbText, dbRelation, dbDateTime, dbTimestamp, dbBigInt, dbInt, dbUuid, dbJson, zodNumber, zodJsonObject, dbMediumText } from '../helpers.mjs';

export const ${camelCase(name)}Schema = {
    kind: '${name}',
    tableName: '${name.toLowerCase()}s',
    owner: ['$userId', 'admin'],
    props: [
        ...baseSchemaProps,
        // name field
        {
            type: "string",
            name: "name",
            required: true,
            unique: false,
            length: 60,
            default: '',
            filterQuery: true,
            db: (prop) => dbVarChar(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        // unique email field
        {
            type: "string",
            name: "email",
            required: true,
            unique: true,
            length: 256,
            default: '',
            filterQuery: true,
            db: (prop) => dbVarChar(prop),
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
            zod: (prop) => zodString(prop).url(),
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
            filterQuery: true,
            db: (prop) => dbVarChar(prop),
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
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
        // enumeration field
        {
            type: "enum",
            name: 'size',
            required: true,
            filterQualifier: true,
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
            filterRange: true,
            db: (prop) => dbInt(prop),
            zod: (prop) => zodNumber(prop).nonnegative(),
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
            filterQualifier: true,
            db: (prop) => dbBoolean(prop),
            enums: [false, true],
            enumLabels: ['Not Cool', 'Very Cool'],
            view: [],
            edit: ['owner'],
        },
        // date field
        {
            type: "date",
            name: "startedAt",
            required: true,
            filterRange: true,
            default: () => new Date(),
            db: (prop) => dbDateTime(prop),
            view: ['public'],
            edit: [],
        },
        // 1:N relationship - aka a relationship to my children
       /* {
            type: "virtual",
            name: '${camelCase(name)}Id', // the name of this record's id in the remote table
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
            name: '${camelCase(name)}GroupId', // the name of the remote record's id in this table
            required: true,
            filterQualifier: true,
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
            filterQualifier: true,
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
};`;

export const generateSchema = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(schemaTemplate(context), toFile(`ving/schema/schemas/${context.name}.mjs`)))
        .then(inject(`import { ${camelCase(context.name)}Schema } from "#ving/schema/schemas/${context.name}.mjs";`, after('import { apikeySchema } from "#ving/schema/schemas/APIKey.mjs";'), toFile('ving/schema/map.mjs')))
        .then(inject(`    ${camelCase(context.name)}Schema,`, after('    apikeySchema,'), toFile('ving/schema/map.mjs')))
        .then(inject(`import { ${context.name}Table } from "#ving/drizzle/schema/${context.name}.mjs";`, after('import { UserTable } from "#ving/drizzle/schema/User.mjs";'), toFile('ving/drizzle/map.mjs')))
        .then(inject(`    ${context.name}: ${context.name}Table,`, after('    User: UserTable,'), toFile('ving/drizzle/map.mjs')));
}