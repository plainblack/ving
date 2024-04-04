import { v4 } from 'uuid';
import { z } from 'zod';
export const uuid = v4;

/**
 * Interrogates the schema and returns a default value for a string prop as defined in the `default`
 * @param {Object} prop An object containing the properties of this prop
 * @param {boolean} skipFunc Defaults to false, skips getting the value if the default is a function
 * @returns a string default
 */
export const stringDefault = (prop, skipFunc = false) => {
    if (typeof prop.default == 'string')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'string')
            return value;
    }
    return '';
}

/**
 * Interrogates the schema and returns a default value for a number prop as defined in the `default`
 * @param {Object} prop An object containing the properties of this prop
 * @param {boolean} skipFunc Defaults to false, skips getting the value if the default is a function
 * @returns a number default
 */
export const numberDefault = (prop, skipFunc = false) => {
    if (typeof prop.default == 'number')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'number')
            return value;
    }
    return 0;
}

/**
 * Interrogates the schema and returns a default value for a boolean prop as defined in the `default`
 * @param {Object} prop An object containing the properties of this prop
 * @param {boolean} skipFunc Defaults to false, skips getting the value if the default is a function
 * @returns a boolean default
 */
export const booleanDefault = (prop, skipFunc = false) => {
    if (typeof prop.default == 'boolean')
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (typeof value == 'boolean')
            return value;
    }
    return false;
}

/**
 * Interrogates the schema and returns a default value for a date prop as defined in the `default`
 * @param {Object} prop An object containing the properties of this prop
 * @param {boolean} skipFunc Defaults to false, skips getting the value if the default is a function
 * @returns a date default
 */

export const dateDefault = (prop, skipFunc = false) => {
    if (prop.default instanceof Date)
        return prop.default;
    if (!skipFunc && typeof prop.default == 'function') {
        const value = prop.default();
        if (value instanceof Date)
            return value;
    }
    return new Date();
}

/**
 * Generates a zod rule for a string prop which must be a string that is at least 1 character long and a length of prop length
 * @param {Object} prop An object containing the properties of this prop
 * @returns a zod rule
 */
export const zodString = (prop) => {
    return z.string().min(1).max(prop.length);
}

/**
 * Generates a zod rule for a number prop which must be a number
 * @param {Object} prop An object containing the properties of this prop
 * @returns a zod rule
 */
export const zodNumber = (prop) => {
    return z.number();
}

/**
 * Generates a zod rule for a json object prop which must be an object
 * @param {Object} prop An object containing the properties of this prop
 * @returns a zod rule
 */
export const zodJsonObject = (prop) => {
    return z.object({});
}

/**
 * Generates a zod rule for a text prop which must be a string with at least 1 character and not more than prop length
 * @param {Object} prop An object containing the properties of this prop
 * @returns a zod rule
 */
export const zodText = (prop) => {
    return z.string().min(1).max(prop.length);
}

/**
 * Generates a zod rule for a text prop which must be a string with at least 1 character and not more 162,777,215
 * @param {Object} prop An object containing the properties of this prop
 * @returns a zod rule
 */
export const zodMediumText = (prop) => {
    return z.string().min(1).max(162777215);
}

/**
 * Generates a drizzle schema field definition for a timestamp prop that defaults itself to now and is not null, and `onUpdateNow()` if `autoUpdate` is set to `true`
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbTimestamp = (prop) => {
    return `timestamp('${prop.name}').defaultNow().notNull()` + (prop.autoUpdate ? '.onUpdateNow()' : '');
}

/**
 * Generates a drizzle schema field definition for a datetime prop with a default value of `1000-01-01 00:00:00` and not null with an `onUpdateNow()` if `autoUpdate` is set to `true`
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbDateTime = (prop) => {
    return `datetime('${prop.name}').default('1000-01-01 00:00:00').notNull()` + (prop.autoUpdate ? '.onUpdateNow()' : '');
}

/**
 * Generates a drizzle schema field definition for a string prop setting it to a varchar of length defined in props and a default value from prop
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbString = (prop) => {
    return `varchar('${prop.name}', { length: ${prop.length} }).notNull().default('${stringDefault(prop, true)}')`;
}

/**
 * Generates a drizzle schema field definition for a text prop setting it to not null
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbText = (prop) => {
    return `text('${prop.name}').notNull()`;
}

/**
 * Generates a drizzle schema field definition for a mediumtext prop setting it to not null
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbMediumText = (prop) => {
    return `mediumText('${prop.name}').notNull()`;
}

/**
 * Generates a drizzle schema field definition for an enum prop setting it to not null with its default value and its list of enaums from the props
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbEnum = (prop) => {
    return `mysqlEnum('${prop.name}', ['${prop.enums.join("','")}']).notNull().default('${stringDefault(prop, true)}')`;
}

/**
 * Generates a drizzle schema field definition for a boolean prop setting it to not null with its default value
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbBoolean = (prop) => {
    return `boolean('${prop.name}').notNull().default(${booleanDefault(prop, true)})`;
}

/**
 * Generates a drizzle schema field definition for an int prop setting it to be not null with its default value
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbInt = (prop) => {
    return `int('${prop.name}').notNull().default(${numberDefault(prop, true)})`;
}

/**
 * Generates a drizzle schema field definition for a json prop setting it to not null with its default value.
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbJson = (prop) => {
    return `json('${prop.name}').notNull().default(${stringDefault(prop, true)})`;
}

/**
 * Generates a drizzle schema field definition for a id prop setting a varchar with a default length of 36 and not null if required or a default of null if not required.
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbId = (prop) => {
    let col = `varchar('${prop.name}', { length: 36 })`;
    if (prop.required) {
        col += `.notNull()`;
    }
    else {
        col += `.default(null)`;
    }
    return col;
}

/**
 * Generates a drizzle schema field definition for a primary key prop. This is included in the `baseSchemaProps` and likely won't be used by you.
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbPk = (prop) => {
    return `${dbId(prop)}.default('uuid-will-be-generated').primaryKey()`;
}

/**
 * Generates a drizzle schema field definition for a relation prop and sets cascade rules based upon whether the fields is required or not.
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbRelation = (prop) => {
    return `${dbId(prop)}.references(() => ${prop.relation?.kind}Table.id, {onDelete: ${prop.required ? '"cascade"' : '"set null"'}, onUpdate: ${prop.required ? '"cascade"' : '"no action"'}})`;
}

/**
 * The base set of props that all Ving schemas share. It includes an `id`, `createdAt`, and `updatedAt`.
 */
export const baseSchemaProps = [
    {
        type: "id",
        name: "id",
        required: true,
        length: 36,
        default: () => uuid(),
        db: (prop) => dbPk(prop),
        view: ['public'],
        edit: [],
    },
    {
        type: "date",
        name: "createdAt",
        filterRange: true,
        required: true,
        default: () => new Date(),
        db: (prop) => dbTimestamp(prop),
        view: ['public'],
        edit: [],
    },
    {
        type: "date",
        name: "updatedAt",
        filterRange: true,
        required: true,
        autoUpdate: true,
        default: () => new Date(),
        db: (prop) => dbTimestamp(prop),
        view: ['public'],
        edit: [],
    },
];
