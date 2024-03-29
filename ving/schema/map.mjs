import { findObject } from '#ving/utils/findObject.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { userSchema } from "#ving/schema/schemas/User.mjs";
import { apikeySchema } from "#ving/schema/schemas/APIKey.mjs";
import { s3fileSchema } from "#ving/schema/schemas/S3File.mjs";

/**
 * An array of all the Ving Schemas
 */
export const vingSchemas = [
    userSchema,
    apikeySchema,
    s3fileSchema,
];

/**
 * Get the schema for a specific kind within the ving schema list.
 * 
 * Usage: `const schema = findVingSchema('users')`
 * 
 * @param {string} nameToFind The table name or kind name to find.
 * @param {string} by Can be `kind` or `tableName`. Defaults to `tableName`.
 * @returns A ving kind schema.
 */
export const findVingSchema = (nameToFind = '-unknown-', by = 'tableName') => {
    try {
        return findObject(vingSchemas, obj => obj[by] == nameToFind);
    }
    catch {
        throw ouch(404, 'ving schema ' + nameToFind + ' not found');
    }
}