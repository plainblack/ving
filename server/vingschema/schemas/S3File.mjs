import { baseSchemaProps, dbString, zodString, dbEnum, dbBoolean, dbText, zodText, dbRelation, dbDateTime, dbTimestamp, dbInt, dbJson, zodNumber } from '../helpers.mjs';

export const s3fileSchema = {
    kind: 'S3File',
    tableName: 's3files',
    owner: ['$userId', 'admin'],
    props: [
        ...baseSchemaProps,
        {
            type: "string",
            name: "filename",
            required: true,
            length: 256,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: ['public'],
            edit: [],
        },
        {
            type: "string",
            name: "s3folder",
            required: true,
            length: 256,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: ['owner'],
            edit: [],
        },
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
        {
            type: "json",
            name: "metadata",
            required: false,
            default: '{}',
            db: (prop) => dbJson(prop),
            zod: (prop) => zodJsonObject(prop),
            view: ['public'],
            edit: [],
        },
        /* text blob field
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
        },*/
        {
            type: "enum",
            name: 'icon',
            required: true,
            length: 20,
            default: 'pending',
            db: (prop) => dbEnum(prop),
            enums: ['pending', 'thumbnail', 'extension', 'self'],
            enumLabels: ['Pending', 'Thumbnail', 'Extension', 'Self'],
            view: [],
            edit: [],
        },
        /* boolean field
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
        */
        // 1:N relationship - aka a relationship to my children
        /* {
             type: "virtual",
             name: 's3filecomments',
             required: false,
             view: ['public'],
             edit: [],
             relation: {
                 type: 'child',
                 name: 's3filecomments',
                 kind: 'S3FileComment',
             },
         },*/
        // N:1 relationship - aka a relationship to my parent
        /*{
            type: "id",
            name: 's3fileGroupId',
            required: true,
            length: 36,
            db: (prop) => dbRelation(prop),
            relation: {
                type: 'parent',
                name: 's3filegroup',
                kind: 'S3FileGroup',
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
    ],
};