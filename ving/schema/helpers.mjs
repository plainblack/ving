import { v4 } from 'uuid';
import { z } from 'zod';
export const uuid = v4;
import { isFunction, isString, isNumber, isBoolean } from '#ving/utils/identify.mjs';
import { ouch } from '#ving/utils/ouch.mjs';

/**
 * Interrogates the schema and returns a default value for a string prop as defined in the `default`
 * @param {Object} prop An object containing the properties of this prop
 * @param {boolean} skipFunc Defaults to false, skips getting the value if the default is a function
 * @returns a string default
 */
export const stringDefault = (prop, skipFunc = false) => {
    if (isString(prop.default))
        return prop.default;
    if (!skipFunc && isFunction(prop.default)) {
        const value = prop.default();
        if (isString(value))
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
    if (isNumber(prop.default))
        return prop.default;
    if (!skipFunc && isFunction(prop.default)) {
        const value = prop.default();
        if (isNumber(value))
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
    if (isBoolean(prop.default))
        return prop.default;
    if (!skipFunc && isFunction(prop.default)) {
        const value = prop.default();
        if (isBoolean(value))
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
    if (!skipFunc && isFunction(prop.default)) {
        const value = prop.default();
        if (value instanceof Date)
            return value;
    }
    return new Date();
}

/**
 * Generates a zod rule for a string prop which must be a string that is at least 1 character long and a length of prop length. There are also aliases called `zodVarChar`, `zodText` and `zodMediumText` that can be used for parity with the `dbVarChar`, `dbText` and `dbMediumText` functions.
 * @param {Object} prop An object containing the properties of this prop
 * @returns a zod rule
 */
export const zodString = (prop) => {
    return z.string().min(0).max(prop.length);
}
export const zodVarChar = zodString;
export const zodText = zodString;
export const zodMediumText = zodString;

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
 * Generates a drizzle schema field definition for a string prop setting it to a varchar of length defined in props and a default value from prop. `dbString()` is an alias for this function.
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbVarChar = (prop) => {
    if (prop.length > 256)
        throw ouch(442, `${prop.name}, a varchar field, cannot have a length greater than 256.`);
    return `varchar('${prop.name}', { length: ${prop.length} }).notNull().default('${stringDefault(prop, true)}')`;
}

export const dbString = dbVarChar;

/**
 * Generates a drizzle schema field definition for a text prop setting it to not null
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbText = (prop) => {
    if (prop.length > 65535)
        throw ouch(442, `${prop.name}, a text field, cannot have a length greater than 65535.`);
    return `text('${prop.name}').notNull()`;
}

/**
 * Generates a drizzle schema field definition for a mediumtext prop setting it to not null
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbMediumText = (prop) => {
    if (prop.length > 16777215)
        throw ouch(442, `${prop.name}, a medium text field, cannot have a length greater than 16777215.`);
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
 * Generates a drizzle schema field definition for an unsigned bigint prop setting it to be not null with its default value
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbBigInt = (prop) => {
    return `bigint('${prop.name}', {mode:'number', unsigned: true}).notNull().default(${numberDefault(prop, true)})`;
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
export const dbUuid = (prop) => {
    let col = `char('${prop.name}', { length: 36 })`;
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
    return `bigint('${prop.name}', {mode:'number', unsigned: true}).notNull().autoincrement().primaryKey()`;
}

/**
 * Generates a drizzle schema field definition for a relation prop and sets cascade rules based upon whether the fields is required or not.
 * @param {Object} prop An object containing the properties of this prop
 * @returns a drizzle field schema definition
 */
export const dbRelation = (prop) => {
    let col = `bigint('${prop.name}', {mode:'number', unsigned: true})`;
    if (prop.required) {
        col += `.notNull()`;
    }
    else {
        col += `.default(null)`;
    }
    return col;
}

/**
 * The base set of props that all Ving schemas share. It includes an `id`, `createdAt`, and `updatedAt`.
 */
export const baseSchemaProps = [
    {
        type: "id",
        name: "id",
        required: false,
        default: undefined,
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
