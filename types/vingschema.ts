import type { ZodTypeAny } from 'zod';

type basicVingProps = {
    name: string,
    //    name: keyof ModelProps<T>,
    view: string[],
    edit: string[],
    noSetAll?: boolean,
    required: boolean,
    relation?: {
        type: 'parent' | 'child' | 'cousin' | 'sibling',
        name: string,
        kind: string,
    },
    unique?: boolean,
}

export type vingProp =
    | {
        type: 'string',
        length: number,
        default: string | (() => string),
        db: (prop: Extract<vingProp, { type: 'string' }>) => string,
        zod?: (prop: Extract<vingProp, { type: 'string' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'enum',
        length: number,
        default: string | (() => string),
        db: (prop: Extract<vingProp, { type: 'enum' }>) => string,
        zod?: (prop: Extract<vingProp, { type: 'enum' }>) => ZodTypeAny,
        enums: [string, ...string[]],
        enumLabels: [string, ...string[]],
    } & basicVingProps
    | {
        type: 'boolean',
        default: boolean | (() => boolean),
        enums: [boolean, boolean],
        enumLabels: [string, ...string[]],
        db: (prop: Extract<vingProp, { type: 'boolean' }>) => string,
        zod?: (prop: Extract<vingProp, { type: 'boolean' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'number',
        default: number | (() => number),
        db: (prop: Extract<vingProp, { type: 'number' }>) => string,
        zod?: (prop: Extract<vingProp, { type: 'number' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'date',
        default: (() => Date),
        db: (prop: Extract<vingProp, { type: 'date' }>) => string,
        zod?: (prop: Extract<vingProp, { type: 'date' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        type: 'id',
        length: 36,
        db: (prop: Extract<vingProp, { type: 'id' }>) => string,
        zod?: (prop: Extract<vingProp, { type: 'id' }>) => ZodTypeAny,
        default: undefined | (() => string),
    } & basicVingProps
    | {
        type: 'virtual',
    } & basicVingProps;

export type vingSchema = {
    kind: string,
    tableName: string,
    owner: string[]
    props: vingProp[],
}
