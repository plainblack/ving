import { vingSchemas } from './map.mjs';
import { isUndefined, isString, isArray } from '#ving/utils/identify.mjs';
import ving from '#ving/index.mjs';
import { RoleOptions } from './schemas/User.mjs';


export const validateSchema = (name) => {
    const schema = vingSchemas.find(s => s.kind == name);
    if (isUndefined(schema))
        throw ving.ouch(404, `Ving schema named ${name} not found.`);

    validateHeader(schema);
}

export const validateHeader = (schema) => {
    validateKind(schema);
    validateTableName(schema);
    validateOwner(schema);
}

export const validateKind = (schema) => {
    if (isUndefined(schema.kind))
        throw ving.ouch(404, `Schema does not have kind.`);
    if (!isString(schema.kind))
        throw ving.ouch(404, `Schema kind is not a string.`);
    if (!(/^[A-Z]/.test(schema.kind)))
        throw ving.ouch(404, `Schema ${schema.kind} kind is not Pascal case.`);
}

export const validateTableName = (schema) => {
    if (!(/^[a-z]/.test(schema.tableName)))
        throw ving.ouch(404, `Schema ${schema.kind} tableName is not lower case.`);
}

export const validateOwner = (schema) => {
    if (!isArray(schema.owner))
        throw ving.ouch(404, `Schema ${schema.kind} owner is not an array.`);
}
