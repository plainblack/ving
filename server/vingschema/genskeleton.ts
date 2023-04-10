import { PinionContext, generator, renderTemplate, toFile, after, inject } from '@feathershq/pinion';

interface Context extends PinionContext {
    // Add the types from prompts and command line arguments here
    name: string
}

const schemaTemplate = ({ name }: Context) =>
    `import { vingSchema } from '../../../types/vingschema';
import { baseSchemaProps, dbString, zodString, dbEnum, dbBoolean, dbText, zodText, dbRelation, dbTimestamp } from '../helpers';

export const ${name.toLowerCase()}Schema: vingSchema = {
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
            name: '${name.toLowerCase()}replies',
            required: false,
            view: ['public'],
            edit: [],
            relation: {
                type: 'child',
                name: '${name.toLowerCase()}replies',
                kind: '${name}Reply',
            },
        },*/
        // N:1 relationship - aka a relationship to my parent
        /*{
            type: "id",
            name: '${name.toLowerCase()}GroupId',
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
        // timestamp/date field
        {
            type: "date",
            name: "startedAt",
            required: true,
            default: () => new Date(),
            db: (prop) => dbTimestamp(prop),
            view: ['public'],
            edit: [],
        },
    ],
};`;

export const generateSchema = (context: Context) => generator(context)
    .then(renderTemplate(schemaTemplate(context), toFile(`server/vingschema/schemas/${context.name}.ts`)))
    .then(inject(`import { ${context.name.toLowerCase()}Schema } from "./schemas/${context.name}";`, after('import { apikeySchema } from "./schemas/APIKey";'), toFile('server/vingschema/index.ts')))
    .then(inject(`    ${context.name.toLowerCase()}Schema,`, after('    apikeySchema,'), toFile('server/vingschema/index.ts')));