import type { AnyMySqlColumnBuilder } from 'drizzle-orm/mysql-core/columns/common';
import type { ZodTypeAny } from 'zod';

type basicVingProps = {
    name: string,
    //    name: keyof ModelProps<T>,
    view: string[],
    edit: string[],
    noSetAll?: boolean,
    required: boolean,
    relation?: {
        type: '1:n' | 'n:1' | 'n:n' | '1:1',
        name: string,
    },
    unique?: boolean,
}

export type vingProp =
    | {
        type: 'string',
        length: number,
        default: string | (() => string),
        db: (prop: Extract<vingProp, { type: 'string' }>) => AnyMySqlColumnBuilder,
        zod?: (prop: Extract<vingProp, { type: 'string' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'enum',
        length: number,
        default: string | (() => string),
        db: (prop: Extract<vingProp, { type: 'enum' }>) => AnyMySqlColumnBuilder,
        zod?: (prop: Extract<vingProp, { type: 'enum' }>) => ZodTypeAny,
        enums: [string, ...string[]],
        enumLabels: [string, ...string[]],
    } & basicVingProps
    | {
        type: 'boolean',
        default: boolean | (() => boolean),
        enums: [boolean, boolean],
        enumLabels: [string, ...string[]],
        db: (prop: Extract<vingProp, { type: 'boolean' }>) => AnyMySqlColumnBuilder,
        zod?: (prop: Extract<vingProp, { type: 'boolean' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'number',
        default: number | (() => number),
        db: (prop: Extract<vingProp, { type: 'number' }>) => AnyMySqlColumnBuilder,
        zod?: (prop: Extract<vingProp, { type: 'number' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'date',
        default: (() => Date),
        db: (prop: Extract<vingProp, { type: 'date' }>) => AnyMySqlColumnBuilder,
        zod?: (prop: Extract<vingProp, { type: 'date' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'id',
        length: 36,
        db: (prop: Extract<vingProp, { type: 'string' }>) => AnyMySqlColumnBuilder,
        zod?: (prop: Extract<vingProp, { type: 'string' }>) => ZodTypeAny,
        default: undefined | (() => string),
    } & basicVingProps;

export type vingSchema = {
    kind: string,
    tableName: string,
    owner: string[]
    props: vingProp[],
}
