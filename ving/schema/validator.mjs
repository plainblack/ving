import { vingSchemas } from './map.mjs';
import { isUndefined, isString, isArray, isBoolean, isFunction, isNumber, isObject } from '#ving/utils/identify.mjs';
import ving from '#ving/index.mjs';
import { RoleOptions } from './schemas/User.mjs';
import { extensionMap } from './schemas/S3File.mjs';

/**
 * Validates all Ving Schemas.
 * @throws 404 if the schema isn't found
 * @throws 441 if the schema is missing an attribute
 * @throws 442 if some attribute is outside of the normal definition
 * @returns {boolean} true
 * @example
 * validateAllSchemas()
 */
export const validateAllSchemas = () => {
    for (const schema of vingSchemas) {
        validateSchema(schema.kind)
    }
    return true;
}

/**
 * Validates a specifically named Ving Schema.
 * @param {string} name The Kind of a ving schema.
 * @throws 404 if the schema isn't found
 * @throws 441 if the schema is missing an attribute
 * @throws 442 if some attribute is outside of the normal definition
 * @returns {boolean} true
 * @example
 * validateSchema('User')
 */
export const validateSchema = (name) => {
    const schema = vingSchemas.find(s => s.kind == name);
    if (isUndefined(schema))
        throw ving.ouch(404, `Ving schema named ${name} not found.`);

    validateKind(schema);
    validateTableName(schema);
    validateOwner(schema);
    validateProps(schema);
    return true;
}

/**
 * Validates the props field of the schema.
 * @param {VingSchema} schema The schema to check against.
 * @throws 441 if the schema is missing an attribute
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateProps(schema)
 */
export const validateProps = (schema) => {
    if (!isArray(schema.props))
        throw ving.ouch(442, `Schema ${schema.kind} props is not an array.`);
    for (const prop of schema.props) {
        validatePropType(prop, schema);
        validatePropName(prop, schema);
        validatePropRequired(prop, schema);
        validatePropDefault(prop, schema);
        validatePropDb(prop, schema);
        validatePropZod(prop, schema);
        validatePropView(prop, schema);
        validatePropEdit(prop, schema);
        validatePropRelation(prop, schema);
        validatePropEnums(prop, schema);
        validatePropEnumLabels(prop, schema);
        validatePropLength(prop, schema);
        validatePropUnique(prop, schema);
        validatePropUniqueQualfiers(prop, schema);
        validatePropFilterQuery(prop, schema);
        validatePropFilterQualifier(prop, schema);
        validatePropAutoUpdate(prop, schema);
    }
}

/**
 * Validates the relation field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropRelation(prop, schema)
 */
export const validatePropRelation = (prop, schema) => {
    if (!['id', 'virtual'].includes(prop.type)) {
        if ('relation' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation should not exist.`);
        return;
    }
    if (prop.type == 'id' && !('relation' in prop)) // not required
        return;
    if (!isObject(prop.relation))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation must be an object.`);
    validateRelationType(prop, schema);
    validateRelationKind(prop, schema);
    validateRelationName(prop, schema);
    validateRelationSkipOwnerCheck(prop, schema);
    validateRelationAcceptedFileExtensions(prop, schema);
}

/**
 * Validates the acceptedFileExtensions attribute of a prop relation.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateRelationAcceptedFileExtensions(prop, schema)
 */
export const validateRelationAcceptedFileExtensions = (prop, schema) => {
    if (!['S3File'].includes(prop.relation.kind) // excluded by kind
        || !['parent'].includes(prop.relation.type) // excluded by type
    ) {
        if ('acceptedFileExtensions' in prop.relation)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.acceptedFileExtensions should not exist.`);
        return;
    }
    if (!('acceptedFileExtensions' in prop.relation)) // optional
        return;
    if (!isArray(prop.relation.acceptedFileExtensions))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.acceptedFileExtensions must be an array.`);
    if (prop.relation.acceptedFileExtensions.length == 0)
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.acceptedFileExtensions must have at least 1 file extension.`);
    const allowedExtensions = Object.keys(extensionMap);
    for (const ext of prop.relation.acceptedFileExtensions) {
        if (!allowedExtensions.includes(ext))
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.acceptedFileExtensions value ${ext} is not an extension listed in the S3File extensionMap.`);
    }
}

/**
 * Validates the skipOwnerCheck attribute of a prop relation.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateRelationSkipOwnerCheck(prop, schema)
 */
export const validateRelationSkipOwnerCheck = (prop, schema) => {
    if (!['parent'].includes(prop.relation.type)) {// excluded by type
        if ('skipOwnerCheck' in prop.relation)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.skipOwnerCheck should not exist.`);
        return;
    }
    if (!('skipOwnerCheck' in prop.relation)) // optional
        return;
    if (!isBoolean(prop.relation.skipOwnerCheck))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.skipOwnerCheck must be a boolean.`);
}

/**
 * Validates the name attribute of a prop relation.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateRelationName(prop, schema)
 */
export const validateRelationName = (prop, schema) => {
    if (!isString(prop.relation.name))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.name must be a string.`);
    if (!/^[a-z]/.test(prop.relation.name))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.name must start with a lower case letter.`);
    if (schema.props.find(p => p.name == prop.relation.name))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.name collides with a prop named ${prop.relation.name}.`);
}

/**
 * Validates the kind attribute of a prop relation.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateRelationKind(prop, schema)
 */
export const validateRelationKind = (prop, schema) => {
    if (!isString(prop.relation.kind))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.kind must be a string.`);
    const otherSchema = vingSchemas.find(s => s.kind == prop.relation.kind);
    if (isUndefined(otherSchema))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.kind refers to a schema that doesn't exist.`);
    if (prop.relation.type == 'child') {
        const childProp = otherSchema.props.find(p => p.name == prop.name);
        if (isUndefined(childProp))
            throw ving.ouch(442, `${formatPropPath(prop, schema)} refers to ${prop.relation.kind}.props.${prop.name} which does not exist.`);
    }
}

/**
 * Validates the type attribute of a prop relation.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateRelationType(prop, schema)
 */
export const validateRelationType = (prop, schema) => {
    if (!isString(prop.relation.type))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.type must be a string.`);
    if (!['child', 'parent'].includes(prop.relation.type))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.type must either child or parent.`);
    if (prop.relation.type == 'parent' && prop.type != 'id')
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.type must be id when ${formatPropPath(prop, schema)}.relation.type is parent.`);
    if (prop.relation.type == 'child' && prop.type != 'virtual')
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.type must be virtual when ${formatPropPath(prop, schema)}.relation.type is child.`);
}

/**
 * Validates the autoUpdate field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropAutoUpdate(prop, schema)
 */
export const validatePropAutoUpdate = (prop, schema) => {
    if (!['date'].includes(prop.type)) {
        if ('autoUpdate' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.autoUpdate should not exist.`);
        return;
    }
    if (!('autoUpdate' in prop)) // not required
        return;
    if (!isBoolean(prop.autoUpdate))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.autoUpdate must be a boolean.`);
}

/**
 * Validates the uniqueQualifiers field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropUniqueQualfiers(prop, schema)
 */
export const validatePropUniqueQualfiers = (prop, schema) => {
    if (!('uniqueQualifiers' in prop)) // optional
        return
    if (prop.unique != true)
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.uniqueQualifiers should not exist.`);
    if (!isArray(prop.uniqueQualifiers))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.uniqueQualifiers must be an array.`);
    if (prop.uniqueQualifiers.length == 0)
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.uniqueQualifiers must have at least one member.`);
    for (const qualifier of prop.uniqueQualifiers) {
        const otherProp = schema.props.find(p => p.name == qualifier);
        if (isUndefined(otherProp))
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.uniqueQualifiers value ${qualifier} does not match another prop name.`);
        if (otherProp.name == prop.name)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.uniqueQualifiers value ${qualifier} references its own prop.`);
    }
}

/**
 * Validates the unique field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropUnique(prop, schema)
 */
export const validatePropUnique = (prop, schema) => {
    if (!['string'].includes(prop.type)) {
        if ('unique' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.unique should not exist.`);
        return;
    }
    if (!('unique' in prop)) // optional
        return
    if (!isBoolean(prop.unique))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.unique must be a boolean.`);
}

/**
 * Validates the length field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropLength(prop, schema)
 */
export const validatePropLength = (prop, schema) => {
    if (!['string'].includes(prop.type)) {
        if ('length' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.length should not exist.`);
        return;
    }
    if (!isNumber(prop.length))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.length must be a number.`);
    if (prop.length < 1)
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.length must be greater than 0.`);
}

/**
 * Validates the enumLabels field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropEnumLabels(prop, schema)
 */
export const validatePropEnumLabels = (prop, schema) => {
    if (!['enum', 'boolean'].includes(prop.type)) {
        if ('enumLabels' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.enumLabels should not exist.`);
        return;
    }
    if (!isArray(prop.enumLabels))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.enumLabels must be an array.`);
    if (prop.enums.length != prop.enumLabels.length)
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.enumLabels must have the same number of options as enums.`);
    for (const value of prop.enumLabels) {
        if (!isString(value))
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.enumLabels values must be strings.`);
    }
}

/**
 * Validates the enums field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropEnums(prop, schema)
 */
export const validatePropEnums = (prop, schema) => {
    if (!['enum', 'boolean'].includes(prop.type)) {
        if ('enums' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.enums should not exist.`);
        return;
    }
    if (!isArray(prop.enums))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.enums must be an array.`);
    if (prop.enums.length == 0)
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.enums must have at least one option.`);
    for (const value of prop.enums) {
        if (prop.type == 'boolean' && !isBoolean(value))
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.enums values must be boolean.`);
        if (prop.type == 'enum' && !isString(value))
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.enums values must be strings.`);
    }
}

/**
 * Validates the edit field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropEdit(prop, schema)
 */
export const validatePropEdit = (prop, schema) => {
    if (!isArray(prop.edit))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.edit must be an array.`);
    for (const role of prop.edit) {
        if (['public', 'owner'].includes(role)) {
            // we're a special keyword that we know
        }
        else if (RoleOptions.includes(role)) {
            // we're a known role
        }
        else {
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.edit role ${role} is unknown.`);
        }
    }
}

/**
 * Validates the view field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropView(prop, schema)
 */
export const validatePropView = (prop, schema) => {
    if (!isArray(prop.view))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.view must be an array.`);
    for (const role of prop.view) {
        if (['public', 'owner'].includes(role)) {
            // we're a special keyword that we know
        }
        else if (RoleOptions.includes(role)) {
            // we're a known role
        }
        else {
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.view role ${role} is unknown.`);
        }
    }
}

/**
 * Validates the zod field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropZod(prop, schema)
 */
export const validatePropZod = (prop, schema) => {
    if (['virtual', 'id', 'date', 'enum', 'boolean'].includes(prop.type) // exempted by type
        || prop.edit?.length == 0 // exempted by being ineditable
        || isFunction(prop.default) // exempted by being autogenerated
    )
        return;
    if (!isFunction(prop.zod))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.zod must be a function that returns a zod validation function.`);
}

/**
 * Validates the db field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropDb(prop, schema)
 */
export const validatePropDb = (prop, schema) => {
    if (['virtual'].includes(prop.type)) {
        if ('db' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.db should not exist.`);
        return;
    }
    if (!isFunction(prop.db))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.db must be a function that returns a drizzle column specification.`);
}

/**
 * Validates the default field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropDefault(prop, schema)
 */
export const validatePropDefault = (prop, schema) => {
    const notSet = !('default' in prop);
    if (['string', 'json', 'enum'].includes(prop.type) && (notSet || !(isString(prop.default) || isFunction(prop.default))))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.default must be a string or a function.`);
    if (['id', 'virtual'].includes(prop.type) && (notSet || !(isNumber(prop.default) || isFunction(prop.default) || isUndefined(prop.default))))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.default must be a number or a function or explicitly undefined.`);
    if (['int'].includes(prop.type) && (notSet || !(isNumber(prop.default) || isFunction(prop.default))))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.default must be a number or a function.`);
    if (['date'].includes(prop.type) && (notSet || !(isFunction(prop.default))))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.default must be a function.`);
    if (['boolean'].includes(prop.type) && (notSet || !(isFunction(prop.default) || isBoolean(prop.default))))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.default must be a function or a boolean.`);
}

/**
 * Validates the filterQuery field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropFilterQuery(prop, schema)
 */
export const validatePropFilterQuery = (prop, schema) => {
    if (!['enum', 'string'].includes(prop.type)) {
        if ('filterQuery' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.filterQuery should not exist.`);
        return;
    }
    if (!('filterQuery' in prop)) // not required
        return;
    if (!isBoolean(prop.filterQuery))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.filterQuery must be a boolean.`);
}

/**
 * Validates the filterQualifier field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropFilterQualifier(prop, schema)
 */
export const validatePropFilterQualifier = (prop, schema) => {
    if (!['enum', 'string', 'int', 'boolean', 'id'].includes(prop.type)) {
        if ('filterQualifier' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.filterQualifier should not exist.`);
        return;
    }
    if (!('filterQualifier' in prop)) // not required
        return;
    if (!isBoolean(prop.filterQualifier))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.filterQualifier must be a boolean.`);
    if (prop.type == 'id' && prop.relation?.type != 'parent')
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.filterQualifier can only exist on type id if the relation.type is parent.`);
}

/**
 * Validates the filterRange field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropFilterRange(prop, schema)
 */
export const validatePropFilterRange = (prop, schema) => {
    if (!['int', 'date'].includes(prop.type)) {
        if ('filterRange' in prop)
            throw ving.ouch(442, `${formatPropPath(prop, schema)}.filterRange should not exist.`);
        return;
    }
    if (!('filterRange' in prop)) // not required
        return;
    if (!isBoolean(prop.filterRange))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.filterRange must be a boolean.`);
}

/**
 * Validates the required field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropRequired(prop, schema)
 */
export const validatePropRequired = (prop, schema) => {
    if (!isBoolean(prop.required))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.required must be a boolean.`);
}

/**
 * Validates the name field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropName(prop, schema)
 */
export const validatePropName = (prop, schema) => {
    if (!(/^[a-zA-Z]/.test(prop.name)))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.name must start with a letter.`);
    if (!(/[a-zA-Z0-9_]+/.test(prop.name)))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.name cannot contain any funky characters.`);
}

/**
 * Validates the type field of a prop.
 * @param {object} prop The prop schema to check against.
 * @param {VingSchema} schema The schema to check against.
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validatePropType(prop, schema)
 */
export const validatePropType = (prop, schema) => {
    const valid = ['boolean', 'int', 'date', 'enum', 'id', 'string', 'json', 'virtual']
    if (!valid.includes(prop.type))
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.type is invalid: ${prop.type}`);
    if (prop.type == 'virtual' && prop.relation.type != 'child')
        throw ving.ouch(442, `${formatPropPath(prop, schema)}.relation.type must be child when ${formatPropPath(prop, schema)}.type is virtual.`);
}


/**
 * Validates the kind field of a schema.
 * @param {VingSchema} schema The schema to check against.
 * @throws 441 if the schema is missing an attribute
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateKind(schema)
 */
export const validateKind = (schema) => {
    if (isUndefined(schema.kind))
        throw ving.ouch(441, `Schema does not have kind.`);
    if (!isString(schema.kind))
        throw ving.ouch(442, `Schema kind is not a string.`);
    if (!(/^[A-Z]/.test(schema.kind)))
        throw ving.ouch(442, `Schema ${schema.kind} kind is not Pascal case.`);
}

/**
 * Validates the tableName field of the schema.
 * @param {VingSchema} schema The schema to check against.
 * @throws 441 if the schema is missing an attribute
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateTableName(schema)
 */
export const validateTableName = (schema) => {
    if (!(/^[a-z]/.test(schema.tableName)))
        throw ving.ouch(442, `Schema ${schema.kind} tableName is not lower case.`);
    if (!(/s$/.test(schema.tableName)))
        throw ving.ouch(442, `Schema ${schema.kind} tableName does not end with an s.`);
    const reserved = ['NULLS', 'MASTER_TLS_CIPHERSUITES', 'MASTER_COMPRESSION_ALGORITHMS', 'GROUPS', 'FAILED_LOGIN_ATTEMPTS',
        'BUCKETS', 'MAX_ROWS', 'MIN_ROWS', 'ROWS', 'ALWAYS', 'COLUMNS', 'CONTAINS', 'DIAGNOSTICS', 'ENDS', 'ENGINES', 'ERRORS',
        'EVENTS', 'FAULTS', 'FIELDS', 'FOLLOWS', 'GRANTS', 'HOSTS', 'IGNORE_SERVER_IDS', 'INDEXES', 'LEAVES', 'LESS', 'LOCKS',
        'LOGS', 'MASTER_LOG_POS', 'MAX_USER_CONNECTIONS', 'NAMES', 'OPTIONS', 'PACK_KEYS', 'PARTITIONS', 'PLUGINS', 'PRECEDES',
        'PRIVILEGES', 'PROFILES', 'RELAY_LOG_POS', 'RETURNS', 'SOUNDS', 'SQL_AFTER_GTIDS', 'SQL_AFTER_MTS_GAPS', 'SQL_BEFORE_GTIDS',
        'STARTS', 'STATS_SAMPLE_PAGES', 'STATUS', 'SUBPARTITIONS', 'SWAPS', 'SWITCHES', 'TABLES', 'TRIGGERS', 'TYPES', 'USER_RESOURCES',
        'VARIABLES', 'WARNINGS', 'OTHERS', 'PROCESS', 'REPLICAS', 'TIES', 'TLS'];
    if (reserved.includes(schema.tableName.toUpperCase()))
        throw ving.ouch(442, `Schema ${schema.kind} tableName matches a MySQL reserved word.`);
}

/**
 * Validates the owner field of a schema
 * @param {VingSchema} schema The schema to check against.
 * @throws 441 if the schema is missing an attribute
 * @throws 442 if some attribute is outside of the normal definition
 * @example
 * validateOwner(schema)
 */
export const validateOwner = (schema) => {
    if (!isArray(schema.owner))
        throw ving.ouch(442, `Schema ${schema.kind} owner is not an array.`);
    for (const owner of schema.owner) {
        if (RoleOptions.includes(owner)) {
            // we're good
        }
        else if (/\$/.test(owner)) {
            const found = owner.match(/^\$(.*)$/);
            if (!isArray(found) || found.length < 2)
                throw ving.ouch(442, `Schema ${schema.kind} owner ${owner} is malformed.`);
            const prop = schema.props.find(p => p.name == found[1]);
            if (isUndefined(prop))
                throw ving.ouch(442, `Schema ${schema.kind} owner ${owner} is not in the props.`);
            if (!(
                (prop.relation?.kind == 'User')
                ||
                (prop.name == 'id' && schema.kind == 'User')
            ))
                throw ving.ouch(442, `Schema ${schema.kind} owner ${owner} must reference a User.`);
        }
        else if (/\^/.test(owner)) {
            const found = owner.match(/^\^(.*)$/);
            if (!isArray(found) || found.length < 2)
                throw ving.ouch(442, `Schema ${schema.kind} owner ${owner} is malformed.`);
            const prop = schema.props.find(p => p.relation?.name == found[1]);
            if (isUndefined(prop))
                throw ving.ouch(442, `Schema ${schema.kind} owner ${owner} is not in the props.`);
            if (prop.relation?.type != 'parent')
                throw ving.ouch(442, `Schema ${schema.kind} owner ${owner} must reference a prop that has a relation type of 'parent'.`);
        }
        else {
            throw ving.ouch(442, `Schema ${schema.kind} owner ${owner} doesn't match any known roles.`);
        }
    }
}


/**
 * Outputs a prop name as an object path
 * @param {object} prop The prop.
 * @param {VingSchema} schema The schema for the prop
 * @example
 * formatPropPath(schema)
 */
export const formatPropPath = (prop, schema) => {
    return `${schema.kind}.props.${prop.name}${prop.type == 'virtual' ? '{' + prop.relation.name + '}' : ''}`
}