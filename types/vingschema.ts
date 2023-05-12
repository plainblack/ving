import type { ZodTypeAny } from 'zod';

type basicVingProps = {
    /** the name of this prop */
    name: string,
    //    name: keyof ModelProps<T>,
    /** the list of roles that can view this prop, may also include `owner` or `public`, automatically also includes everything from `edit` */
    view: string[],
    /** the list of roles that can edit this prop, may also include `owner` or `public` */
    edit: string[],
    /** whether or not to skip this prop when calling `setAll`, defaults to false  */
    noSetAll?: boolean,
    /** whether this prop must be specified in order to create this record */
    required: boolean,
    /** attributes for forming relationships with other records */
    relation?: {
        /** `parent` is a 1:N, while `child` is a N:1 */
        type: 'parent' | 'child' | 'cousin' | 'sibling',
        /** the unique name of this relationship */
        name: string,
        /** the `kind` of record this is being related to */
        kind: string,
    },
    /** should this prop be indexed as unique */
    unique?: boolean,
}

export type vingProp =
    | {
        /** union discriminated by type `string` */
        type: 'string',
        /** the maximum number of characters for the string */
        length: number,
        /** the value the prop should default to */
        default: string | (() => string),
        /** the drizzle definition for this prop */
        db: (prop: Extract<vingProp, { type: 'string' }>) => string,
        /** the zod validation definition for this prop */
        zod?: (prop: Extract<vingProp, { type: 'string' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        /** union discriminated by type `enum` */
        type: 'enum',
        /** the maximum number of characters that can be stored in this field */
        length: number,
        /** the value the prop should default to */
        default: string | (() => string),
        /** the drizzle definition for this prop */
        db: (prop: Extract<vingProp, { type: 'enum' }>) => string,
        /** the zod validation definition for this prop */
        zod?: (prop: Extract<vingProp, { type: 'enum' }>) => ZodTypeAny,
        /** the list of enumerated values for this prop */
        enums: [string, ...string[]],
        /** the list of enumerated human readable labels for this prop */
        enumLabels: [string, ...string[]],
    } & basicVingProps
    | {
        /** union discriminated by type `boolean` */
        type: 'boolean',
        /** the value the prop should default to */
        default: boolean | (() => boolean),
        /** the list of enumerated values for this prop, must be `true` and `false`, but can be in either order */
        enums: [boolean, boolean],
        /** the list of enumerated human readable labels for this prop */
        enumLabels: [string, ...string[]],
        /** the drizzle definition for this prop */
        db: (prop: Extract<vingProp, { type: 'boolean' }>) => string,
        /** the zod validation definition for this prop */
        zod?: (prop: Extract<vingProp, { type: 'boolean' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        /** union discriminated by type `number` */
        type: 'number',
        /** the value the prop should default to */
        default: number | (() => number),
        /** the drizzle definition for this prop */
        db: (prop: Extract<vingProp, { type: 'number' }>) => string,
        /** the zod validation definition for this prop */
        zod?: (prop: Extract<vingProp, { type: 'number' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        /** union discriminated by type `date` */
        type: 'date',
        /** whether or not this date should automatically change upon db update */
        autoUpdate?: boolean,
        /** the value the prop should default to */
        default: (() => Date),
        /** the drizzle definition for this prop */
        db: (prop: Extract<vingProp, { type: 'date' }>) => string,
        /** the zod validation definition for this prop */
        zod?: (prop: Extract<vingProp, { type: 'date' }>) => ZodTypeAny,
    } & basicVingProps
    | {
        /** union discriminated by type `id` */
        type: 'id',
        /** the length of the field to store an id */
        length: 36,
        /** the drizzle definition for this prop */
        db: (prop: Extract<vingProp, { type: 'id' }>) => string,
        /** the zod validation definition for this prop */
        zod?: (prop: Extract<vingProp, { type: 'id' }>) => ZodTypeAny,
        /** the value the prop should default to */
        default: undefined | (() => string),
    } & basicVingProps
    | {
        /** union discriminated by type `virtual` */
        type: 'virtual',
    } & basicVingProps;

export type vingSchema = {
    /** the name of the VingKind to be created */
    kind: string,
    /** the name of the table where this kinds data will be stored */
    tableName: string,
    /** the definition of the owner for this record. can be `admin` or `public`, but can also contain a field name that maps to a user id which in that case will start with a $ like `$userId` */
    owner: string[]
    /** the list of database stored props for this kind */
    props: vingProp[],
}
