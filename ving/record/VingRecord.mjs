import { findVingSchema } from '#ving/schema/map.mjs';
import ving from '#ving/index.mjs';
import { isObject, isUndefined, isNil, isNull, isNumber } from '#ving/utils/identify.mjs';
import { eq, asc, desc, and, ne, sql, getTableName, count, sum, avg, min, max } from '#ving/drizzle/orm.mjs';
import { stringDefault, booleanDefault, numberDefault, dateDefault } from '#ving/schema/helpers.mjs';
import { parseId, stringifyId } from '#ving/utils/int2str.mjs';
import { useKind } from '#ving/record/utils.mjs';

/**
 * Creates a select list options datastructure from the `enums` and `enumLabels` on a ving schema.
 * 
 * @param {string[]} enums An array of enumerated values
 * @param {string[]} labels An array of enumerated labels
 * @returns {object[]} An array of objects that combines enums and labels into an object with attributes of `label` and `value`
 * @example
 * const options = enum2options([true,false], ['Is Admin','Is Not Admin'])
 */
export const enum2options = (enums, labels) => {
    const options = [];
    let i = 0
    for (let value of enums) {
        const label = (!isUndefined(labels) && !isUndefined(labels[i])) ? labels[i] : value.toString();
        options.push({
            value,
            label,
        })
        i++
    }
    return options;
}

/**
 * Locates and returns one prop from the list of props
 * 
 * @param {string} name The name of the prop you are looking for
 * @param {object[]} props The list of schema props to search in
 * @returns {object} The prop object
 * 
 * findPropInSchema('useAsDisplayName', [])
 */
export const findPropInSchema = (name, props) => {
    return props.find(prop => prop.name == name);
}

/** The core of all functionality in ving where data, business logic, permissions meet to form web services and more. A good analagy is that Ving Kind is equivalent to a database table where a Ving Record is equivalent to a database row.
 * @class
 */
export class VingRecord {

    #deleted = false;
    #props = {};
    #dirty = [];
    #inserted = false;

    /** 
     * `true` if the record has been inserted into the database, or `false` if it has not
     */
    get isInserted() {
        return this.#inserted;
    }

    /**
     * An array of warnings
     */
    warnings = [];

    /**
     * You'll almost never call this directly, but instead it will be called by a subclass of VingKind.
     * 
     * @param {Object} db A mysql2 database connection or pool
     * @param {string} table The drizzle database table definition
     * @param {Object} props Initializers for props
     * @param {boolean} inserted Whether or not the record already exists in the database
     * @example
     * const user = new UserRecord(db, UsersTable)
     */
    constructor(db, table, props, inserted = true) {
        this.#props = props;
        this.#inserted = inserted;
        this.db = db;
        this.table = table;
        const schema = findVingSchema(getTableName(table));
        const pseudoProps = {}
        for (const prop of schema.props) {
            if (prop.type == 'virtual')
                continue;
            pseudoProps[prop.name] = {
                get() {
                    return this.get(prop.name);
                },
                set(value) {
                    return this.set(prop.name, value);
                },
            }
        }
        Object.defineProperties(this, pseudoProps);
    }

    /**
     * Add a warning to the `warnings` list
     * 
     * @param {Object} warning A warning object that has a `code`, and a `message`
     * @param {number} warning.code A 3 digit error code
     * @param {string} warning.message A human readable message
     * @example
     * user.addWarning({code: 404, message:'Brain not found.'})
     */
    addWarning(warning) {
        this.warnings?.push(warning);
    }

    /**
     * The same as `isOwner` except throws a `403` error instead of returning `false`
     * 
     * @param {Object} currentUser A `User` or `Session`
     * @throws 403
     * @returns {boolean} Returns `true`
     * @example
     * await apikey.canEdit(session)
     */
    async canEdit(currentUser) {
        if (await this.isOwner(currentUser)) {
            return true;
        }
        const schema = findVingSchema(getTableName(this.table));
        ving.log('VingRecord').warn(`${currentUser.get('id')} does not have the privileges to access ${schema.kind} id ${this.get('id')}.`);
        throw ving.ouch(403, `You do not have the privileges to access ${schema.kind}.`)
    }

    /**
     * Creates a new record based upon the props of an old one. Note that this doesn't save the new record to the database, you'll need to call `insert()` on it to do that.
     * 
     * @returns {VingRecord} a newly minted record based upon the original props
     * @example
     * const newRecord = this.copy()
     */
    async copy() {
        const schema = findVingSchema(getTableName(this.table));
        const kind = await useKind(schema.kind);
        let props = { ...this.getAll() };
        delete props.id;
        delete props.createdAt;
        return kind.mint(props);
    }

    /**
     * Removes the record from the database
     * @example
     * await user.delete()
     */
    async delete() {
        this.#deleted = true;
        await this.db.delete(this.table).where(eq(this.table.id, this.#props.id));
    }

    /**
     * Serialize the information about this record in a permission sensitive way
     * 
     * @param {Object} params A list of params to change the output of the describe. Defaults to `{}`
     * @param {Object} params.currentUser The `User` or `Session` instance to test ownership against
     * @param {Object} params.include An object containing which things to be included in the description beyond the props
     * @param {boolean} params.include.links If `true` will add a list of API links to the description
     * @param {boolean} params.include.meta If `true` will add a list of generated metadata to the description
     * @param {boolean} params.include.options If `true` will add a list of field options to the description
     * @param {boolean} params.include.private If `true` will ignore ownership considerations when formulating the description
     * @param {string[]} params.include.related An array of parent relationship names, which will then include those related objects in the description
     * @param {string[]} params.include.extra Some `VingRecord`s may define weird description functions that can be initiated by naming it in this array
     * @returns {object} Serialized version of the `VingRecord`
     * @example
     * const description = await user.describe({currentUser: session})
     */
    async describe(params = {}) {
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = !isUndefined(currentUser) && await this.isOwner(currentUser);
        const schema = findVingSchema(getTableName(this.table));
        let out = { props: { id: this.idAsString(schema.kind) } };
        if (include?.links) {
            const vingConfig = await ving.getConfig();
            out.links = await this.describeLinks(out.props.id, vingConfig.rest.version, schema, params);
        }
        if (include?.options) {
            out.options = await this.propOptions(params);
        }
        if (include?.meta) {
            out.meta = {
                kind: schema.kind,
                isOwner,
            };
            if (this.#deleted) {
                out.meta.deleted = true;
            }
        }
        if (include?.related?.length) {
            out.related = {};
        }
        if (include?.extra?.length) {
            out.extra = {};
        }
        if (this.warnings?.length) {
            out.warnings = this.warnings;
        }

        for (const field of schema.props) {

            // meta 
            if (isObject(out.meta)
                && include.meta
            ) {
                if (field.allowRealPubicId) {
                    if (!isObject(out.meta.realId)) out.meta.realId = {};
                    out.meta.realId[field.name] = this.#props[field.name];
                }
            }

            if (field.name == 'id') // already done
                continue;

            // determine field visibility
            const roles = [...field.view, ...field.edit];
            const visible = roles.includes('public')
                || (include?.private)
                || (roles.includes('owner') && isOwner)
                || (currentUser?.isaRole(roles));
            if (!visible) continue;

            // props
            if (field.type == 'id')
                out.props[field.name] = stringifyId(this.#props[field.name], field.relation?.kind || schema.kind);
            else
                out.props[field.name] = this.#props[field.name];

            // links 
            if (isObject(out.links)
                && include.links
                && field.relation
                && isObject(out.links.self)
            ) {
                let lower = field.relation.name.toLowerCase();
                out.links[lower] = { href: `${out.links.self.href}/${lower}`, methods: ['GET'], usage: 'rest' };
                if (field.relation.type == 'child')
                    out.links[lower].methods.push('DELETE');
            }

            // relations
            if (field.relation
                && ['parent', 'sibling'].includes(field.relation.type)
            ) {
                if (isObject(out.related) && include.related?.includes(field.relation.name)) {
                    const parent = await this.parent(field.relation.name);
                    out.related[field.relation.name] = await parent.describe(params);
                }
            }

        }

        return out;
    }

    /**
     * Describe links for this record. This is called by `describe()`.
     * 
     * The `describe()` method will also add links for the record's relations after it calls this method.
     * 
     *
     * @async
     * @param idString {string} The id of the record represented as a string
     * @param restVersion {string} The version of the REST API.
     * @param schema {VingSchema} The schema for this record.
     * @param params {Object} Same as `describe()`
     * @returns {object} A list of links. It generates these links for now, and is meant to be overridden by subclasses to add more links.
     * 
     *```js
     * {
     *     base: { href: '/api/v1/user', methods: ['GET','POST'], usage: 'rest' }, // the base URL for the REST API for this kind
     *     self: { href: '/api/v1/user/xxx', methods: ['GET','PUT','DELETE'], usage: 'rest' }, // the URL for this instance of this record
     * ```
     * @example
     * const links = await user.describeLinks(params)
     * 
     * 
     */
    async describeLinks(idString, restVersion, schema, params = {}) {
        const links = { base: { href: `/api/${restVersion}/${schema.kind?.toLowerCase()}s`, methods: ['GET', 'POST'], usage: 'rest' } };
        links.self = { href: `${links.base.href}/${idString}`, methods: ['GET', 'PUT', 'DELETE'], usage: 'rest' };
        return links;
    }

    /**
     * Retrieve the value of a prop from this record
     * 
     * @param {string} key The name of the prop
     * @returns {*} A value
     * @example
     * const value = user.get('id')
     */
    get(key) {
        return this.#props[key];
    }

    /**
     * Retrieve an object of name/value pairs from this record
     * 
     * @returns {object} An object of name/value pairs
     * @example
     * const props = user.getAll()
     */
    getAll() {
        return this.#props;
    }

    /**
     * Gets the encrypted stringified version of this record's ID, used in rest endpoints and other external places.
     * @param {string} kind - Optional, it will use the kind of this record if not set.
     * @returns {string} encrypted id
     * @example
     * user.idAsString()
     */
    idAsString(kind) {
        let k = kind;
        if (!k) {
            const schema = findVingSchema(getTableName(this.table));
            k = schema.kind;
        }
        return stringifyId(this.get('id'), k);
    }

    /**
     * Inserts the current record into the database
     * @example
     * await user.insert()
     */
    async insert() {
        if (this.#inserted) {
            const schema = findVingSchema(getTableName(this.table));
            ving.log('VingRecord').error(`${schema.kind} already inserted as ${this.get('id')} `)
            throw ving.ouch(409, `${schema.kind} already inserted`);
        }
        this.#inserted = true;
        this.#dirty = [];
        const result = await this.db.insert(this.table).values(this.#props);
        this.#props.id = result[0].insertId;
    }

    /**
     * Determine whether a user owns the current record. 
     * 
     * @param {Object} currentUser A `User` or `Session`
     * @returns {boolean} Whether or not the passed in user owns this record or not
     * @example
     * const owner = await apikey.isOwner(session)
     */
    async isOwner(currentUser) {
        if (isUndefined(currentUser))
            return false;
        const schema = findVingSchema(getTableName(this.table));
        for (let owner of schema.owner) {
            let found = owner.match(/^\$(.*)$/);
            if (found) {
                if (this.#props[found[1]] == currentUser.getRoleProp('id'))
                    return true;
            }
            found = owner.match(/^([A-Za-z]+)$/);
            if (found) {
                if (found[1] && currentUser.isRole(found[1]) == true)
                    return true;
            }
            found = owner.match(/^\^(.*)$/);
            if (found) {
                const parent = this.parent(found[1]);
                if (parent && await parent.isOwner(currentUser))
                    return true;
            }
        }
        return false;
    }

    #parentCache = {};
    /**
     * Returns a record related to this record by relationship name.
     * 
     * A cache of previously fetched parent objects is kept so that subsequent calls to this 
     * method with the same name will not hit the database multiple times. You can flush this
     * cache by calling either `refresh()` or  `flushParentCache()`.
     * 
     * @param {string} name The relation name
     * @throws 404 if it can't find the parent by name
     * @returns {VingRecord} A record related to the this record
     * @example
     * const user = await apikey.parent('user')
     */
    async parent(name) {
        if (name in this.#parentCache)
            return this.#parentCache[name];
        const prop = this.parentPropSchema(name);
        return this.#parentCache[name] = await (await useKind(prop.relation.kind)).findOrDie(this.get(prop.name));
    }

    /**
     * Returns the schema of the named parent prop, which can be useful for looking up special attributes.
     * @param {string} name The name of the parent prop to find.
     * @throws 404 if prop can't be found.
     * @returns {object} A ving schema prop schema.
     * @example
     * user.parentPropSchema('avatar')
     */
    parentPropSchema(name) {
        const schema = findVingSchema(getTableName(this.table));
        const found = schema.props.find(obj => obj.relation?.name == name);
        if (isUndefined(found)) {
            ving.log('VingRecord').error(`cannot find parent prop by ${name} in ving schema ${schema.kind} `);
            throw ving.ouch(404, `cannot find parent prop by ${name} in ving schema ${schema.kind} `);
        }
        return found;
    }

    /**
     * Flushes the parent cache created by calling the `parent()` method.
     * @example
     * apikey.flushParentCache()
     */
    flushParentCache() {
        this.#parentCache = {};
    }


    /**
     * Returns a query to fetch the children of a child relationship attached to this kind's schema.
     * 
     * @param {string} name The relation name
     * @throws 404 if it can't find the children by name
     * @returns {object} A drizzle query.
     * @example
     * const apikeys = await user.children('apikeys')
     */
    async children(name) {
        const schema = findVingSchema(getTableName(this.table));
        const prop = schema.props.find(obj => obj.relation?.name == name);
        if (isUndefined(prop))
            throw ouch(404, `cannot find child prop by ${name} in ${schema.kind} `);
        const kind = await useKind(prop.relation.kind);
        if (isUndefined(kind.table[prop.name]))
            ving.log('VingRecord').error(`${schema.kind} has an invalid virtual prop name called ${name} `);
        kind.propDefaults.push({
            prop: prop.name,
            field: kind.table[prop.name],
            value: this.get('id'),
        });
        return kind;
    }

    /**
     * Returns a list of the enumerated prop options available to the current user. These options can be used to validate the data submitted to this field. 
     * 
     * @param {Object} params A list of params to change the output of the describe. Defaults to `{ } `
     * @param {Object} params.currentUser The `User` or `Session` instance to test ownership against
     * @param {Object} params.include An object containing which things to be included in the description beyond the props
     * @param {boolean} params.include.links If `true` will add a list of API links to the description
     * @param {boolean} params.include.meta If `true` will add a list of generated metadata to the description
     * @param {boolean} params.include.options If `true` will add a list of field options to the description
     * @param {boolean} params.include.private If `true` will ignore ownership considerations when formulating the description
     * @param {string[]} params.include.related An array of parent relationship names, which will then include those related objects in the description
     * @param {string[]} params.include.extra Some `VingRecord`s may define weird description functions that can be initiated by naming it in this array
     * @param {boolean} all Include all options regardless of the `currentUser`. Defaults to `false`.
     * @returns {object[]} a list of the enumerated prop options
     * @example
     * const options = await user.propOptions({currentUser: session})
     */
    async propOptions(params = {}, all = false) {
        const options = {};
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = !isUndefined(currentUser) && await this.isOwner(currentUser);
        for (const prop of findVingSchema(getTableName(this.table)).props) {
            const roles = [...prop.view, ...prop.edit];
            const visible = roles.includes('public')
                || (include?.private)
                || (roles.includes('owner') && (isOwner || all))
                || (currentUser?.isaRole(roles));
            if (!visible)
                continue;
            if ((prop.type == 'enum' || prop.type == 'boolean') && prop.enums && prop.enums.length > 0) {
                options[prop.name] = enum2options(prop.enums, prop.enumLabels);
            }
            else if (prop.options) {
                options[prop.name] = await this[prop.options]();
            }
            else if (prop.relation
                && ['parent', 'sibling'].includes(prop.relation.type)
                && 'acceptedFileExtensions' in prop.relation
            ) {
                options[prop.relation.name] = prop.relation.acceptedFileExtensions;
            }
        }
        return options;
    }

    /**
     * Fetches the props from the database and overwrites whats in memory. Also flushes the parent relation cache.
     * 
     * @returns {object} the same as `getAll()`
     */
    async refresh() {
        this.flushParentCache();
        return this.#props = (await this.db.select().from(this.table).where(eq(this.table.id, this.#props.id)))[0];
    }

    /**
     * Assign a value to a prop
     * 
     * @param {string} key The name of the prop
     * @param {*} value The value to set
     * @returns {*} The value that was set
     * @example
     * user.set('username', 'andy')
     */
    set(key, value) {
        const schema = findVingSchema(getTableName(this.table));
        const prop = findPropInSchema(key, schema.props);
        if (prop) {
            if (prop.type != 'virtual' && prop.zod) {
                const result = prop.zod(prop).safeParse(value);
                if (result.success) {
                    value = result.data;
                }
                else {
                    const formatted = result.error.format();
                    ving.log('VingRecord').error(key.toString() + ': ' + formatted._errors.join('.') + '.');
                    throw ving.ouch(442, key.toString() + ': ' + formatted._errors.join('.') + '.', key);
                }
            }
            if (prop?.relation?.type == 'parent')
                this.flushParentCache();
        }
        else {
            ving.log('VingRecord').error(key.toString() + ' is not a prop');
            throw ving.ouch(400, key.toString() + ' is not a prop', key);
        }
        if (value != this.#props[key] && !this.#dirty.includes(key))
            this.#dirty.push(key);
        return this.#props[key] = value;
    }

    /**
     * Set a subset of values of a record.
     * 
     * @param {object} props An object containing name/value pairs to set. Doesn't need to be a complete list of all values.
     * @returns {object} The same as `getAll()`
     * @example
     * user.setAll({ username : 'andy' })
     */
    setAll(props) {
        const schema = findVingSchema(getTableName(this.table));
        for (const key in props) {
            const field = findPropInSchema(key, schema.props)
            if (!field?.noSetAll)
                this.set(key, props[key]);
        }
        return this.#props;
    }

    /**
     * Sets props in a permission safe way
     * 
     * @param {Object} params A list of props to be set
     * @param {User|Session} currentUser A `User` or `Session`
     * @throws 441 if a required field isn't set
     * @throws 409 if a unique constraint fails
     * @returns {boolean} `true` if set, or an exception if it couldn't be
     * @example
     * await user.setPostedProps({username: 'andy'}, session)
     */
    async setPostedProps(params, currentUser) {
        const schema = findVingSchema(getTableName(this.table));
        const isOwner = !isUndefined(currentUser) && await this.isOwner(currentUser);

        for (const field of schema.props) {
            const fieldName = field.name.toString();
            const param = field.type == 'id' && !isNil(params[field.name]) && !isNumber(params[field.name]) ? parseId(params[field.name]) : params[field.name];
            const roles = [...field.edit];
            const editable = (roles.includes('owner') && (isOwner || !this.isInserted)) || (currentUser?.isaRole(roles));
            if (!editable) { // skip it if the field isn't editable
                continue;
            }
            if (isUndefined(param)) { // skip it if the field is undefined 
                continue;
            }
            if (field.relation && field.relation.type != 'parent') { // skip it if it is a relation that isn't a parent
                continue;
            }
            if (param === '' && field.required) { // error if an empty value is assigned to a required field
                ving.log('VingRecord').warn(`${fieldName} is required in ${schema.kind}.`);
                throw ving.ouch(441, `${fieldName} is required.`, fieldName);
            }
            if (field.unique) { // do if field is marked unique
                const query = this.db.select({ count: sql`count(*)`.as('count') }).from(this.table);
                let where = eq(this.table[field.name], params[field.name]);
                if (this.isInserted) // check against own id if it is already inserted
                    where = and(where, ne(this.table.id, this.get('id')));
                if (field.uniqueQualifiiers) { // add a clause for each uniqueQualifier
                    for (const qualifier of field.uniqueQualifiiers) {
                        where = and(where, eq(this.table[qualifier], params[qualifier] || this.get(qualifier)));
                    }
                }
                let count = (await query.where(where))[0].count
                if (count > 0) { // error if we find any duplicates
                    ving.log('VingRecord').warn(`${isNil(this.get('id')) ? 'new record' : this.get('id').toString()} unique check failed on ${field.name.toString()} `)
                    throw ving.ouch(409, `${field.name.toString()} must be unique, but ${params[field.name]} has already been used.`, field.name)
                }
            }
            if (isNull(param)) { // skip it if the value is null
                continue;
            }
            if (field.options) {
                const options = await this[field.options]();
                const optionsValues = options.map(o => o.value);
                if (!optionsValues.includes(param)) {
                    ving.log('VingRecord').warn(`${field.name.toString()} was set to an invalid value`)
                    throw ving.ouch(442, `${field.name.toString()} was set to an invalid value`, field.name)
                }
            }
            this.set(field.name, param);
            if (field.relation && field.relation.type == 'parent') { // is this a parent relation
                const parent = await this.parent(field.relation.name);
                if (!field.relation.skipOwnerCheck) // skip check if schema says so
                    await parent.canEdit(currentUser); // error if not owner
            }
        }
        return true;
    }

    /**
     * Verifies that the record has valid and required info to be created in the database
     * 
     * @param {Object} params A list of props to be set
     * @throws 441 if a required field isn't set
     * @returns {boolean} `true` if all the required params exist and validate or an exception if not
     * @example
     * user.testCreationProps({username: 'andy'})
     */
    testCreationProps(params) {
        const schema = findVingSchema(getTableName(this.table));
        for (const prop of schema.props) {
            if (!prop.required || prop.type == 'virtual' || !isNil(prop.default) || prop.relation)
                continue;
            if (!isNil(params[prop.name]))
                continue;
            const fieldName = prop.name.toString();
            ving.log('VingRecord').warn(`${fieldName} is required in ${schema.kind}.`);
            throw ving.ouch(441, `${fieldName} is required.`, fieldName);
        }
        return true;
    }

    /**
     * Updates the record in the database with only the changed values currently in memory
     * @example
     * await user.update()
     */
    async update() {
        if (this.#dirty.length == 0)
            return; // nothing worth updating
        const schema = findVingSchema(getTableName(this.table));
        // auto-update auto-updating date fields
        for (const field of schema.props) {
            if (field.type == 'date' && field.autoUpdate) {
                this.#props[field.name] = new Date();
            }
        }
        const propsToUpdate = Object.fromEntries(
            Object.entries(this.#props).filter(
                ([key, val]) => this.#dirty.includes(key)
            )
        );
        this.#dirty = [];
        await this.db.update(this.table).set(propsToUpdate).where(eq(this.table.id, this.#props.id));
    }

    /**
     * A permission safe way to update the props of a record. Calls `setPostedProps` then `update`.
     * 
     * @param {Object} params props to update
     * @param {User|session} currentUser A `User` or `Session`
     * @example
     * await user.updateAndVerify({username:'andy'}, session)
     */
    async updateAndVerify(params, currentUser) {
        await this.setPostedProps(params, currentUser);
        await this.update();
    }
}

/** The master class for Ving Records, that binds them all together and allows you to search for, update, and delete them. A good analagy is that Ving Kind is equivalent to a database table where a Ving Record is equivalent to a database row.
 * @class
 */
export class VingKind {

    /**
     * The start of a Drizzle delete query on this table
     */
    get delete() { return this.db.delete(this.table) }

    /**
     * The start of a Drizzle insert query on this table
     */
    get insert() { return this.db.insert(this.table) }

    /**
     * A list of defaults for any records created or fetched from this kind. Typically used to bootstrap relationship records.
     */
    propDefaults = []

    /**
     * The start of a Drizzle select query on this table
     */
    get select() { return this.db.select().from(this.table) }

    /**
     * The start of a Drizzle update query on this table
     */
    get update() { return this.db.update(this.table) }

    /**
     * 
     * @param {Object} db A mysql2 database connection or pool
     * @param {Object} table A drizzle table definition
     * @param {Object} recordClass a reference to the record class to instanciate upon fetching or creating records from this kind
     * @example
     * const users = UserKind(db, UsersTable, UserRecord)
     */
    constructor(db, table, recordClass) {
        this.db = db;
        this.table = table;
        this.recordClass = recordClass;
    }

    /**
     * Adds `propDefaults` (if any) into a where clause to limit the scope of affected records. As long as you're using the built in queries you don't need to use this method. But you might want to use it if you're using `create`, `select`, `update`, or `delete ` directly.
     * 
     * @param {Object} where A drizzle where clause
     * @returns {object} A drizzle where clause
     * @example
     * const results = await Users.delete.where(Users.calcWhere(like(Users.table.realName, 'Fred%')));
     */
    calcWhere(where) {
        let defaults = undefined;
        if (this.propDefaults) {
            for (const item of this.propDefaults) {
                const pair = eq(item.field, item.value);
                if (defaults) {
                    defaults = and(pair, defaults);
                }
                else {
                    defaults = pair;
                }
            }
        }
        if (where && defaults) {
            return and(where, defaults);
        }
        else if (where) {
            return where;
        }
        else if (defaults) {
            return defaults;
        }
        return undefined;
    }

    /**
     * Get the number of records of this kind
     * 
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     * @example
     * const numberOfUsers = await Users.count()
     */
    async count(where) {
        return (await this.db.select({ value: count() }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
     * Sum the values of a field of this kind
     * 
     * @param {string} field The name of the column to sum
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     * @example
     * await S3Files.sum('sizeInBytes')
     */
    async sum(field, where) {
        return (await this.db.select({ value: sum(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value * 1;
    }

    /**
     * Average the values of a field of this kind
     * 
     * @param {string} field The name of the column to average
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     * @example
     * await S3Files.avg('sizeInBytes')
     */
    async avg(field, where) {
        return (await this.db.select({ value: avg(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value * 1;
    }

    /**
     * Get the minimum value for a field of this kind
     * 
     * @param {string} field The name of the column to get the minimum
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     * @example
     * await S3Files.min('sizeInBytes')
     */
    async min(field, where) {
        return (await this.db.select({ value: min(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
    * Get the maximum value for a field of this kind. 
    * 
    * @param {string} field The name of the column to get the maximum
    * @param {Object} where A drizzle where clause
    * @returns {number} A count of the records
    * @example
    * await S3Files.max('sizeInBytes')
    */
    async max(field, where) {
        return (await this.db.select({ value: max(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
     * Creates a new record in the database. This is the same as calling `mint` and then `insert` on the minted record.
     * 
     * @param {Object} props The list of props to add to this record
     * @returns {VingRecord} A newly minted record
     * @example
     * const record = Users.create({username: 'andy'})
     */
    async create(props) {
        const obj = this.mint(props);
        await obj.insert();
        return obj;
    }

    /**
     * Creates a new record in the database in a permission safe way. This is the same as calling `mint`, then `testCreationProps` then `setPostedProps`, then `insert`.
     *
     * @param {Object} props A list of props
     * @param {Object} currentUser A `User` or `Session`
     * @throws 441 if no currentUser is passed
     * @returns {VingRecord} A newly minted record or throws an error if validation fails
     * @example
     * const record = await Users.createAndVerify({username: 'andy'}, currentUser)
     */
    async createAndVerify(props, currentUser) {
        if (isUndefined(currentUser))
            throw ving.ouch(441, `createAndVerify requires a user or session to test privileges against`);
        const obj = this.mint({});
        obj.testCreationProps(props);
        await obj.setPostedProps(props, currentUser);
        await obj.insert();
        return obj;
    }

    /**
     * Format a privilege safe paginated list of records
     * 
     * @param {Object} params A list of params to change the output of the describe. Defaults to `{ } `
     * @param {string} params.sortOrder Either `desc` or `asc` for descending order or ascending order. Defaults to `asc`
     * @param {string[]} params.sortBy An array of prop names to sort by. Defaults to `createdAt`
     * @param {number} params.itemsPerPage How many items to include in 1 page of results, defaults to `10`, must be between `1` and `100`.
     * @param {number} params.page The page number of results to display. Defaults to `1`.
     * @param {maxItems} params.maxItems The maximum number of items that may be paginated. Defaults to `100000000000`
     * @param {Object} params.objectParams An object formatted for `describe()` in `VingRecord`
     * @param {Object} params.objectParams.currentUser The `User` or `Session` instance to test ownership against
     * @param {Object} params.objectParams.include An object containing which things to be included in the description beyond the props
     * @param {boolean} params.objectParams.include.links If `true` will add a list of API links to the description
     * @param {boolean} params.objectParams.include.meta If `true` will add a list of generated metadata to the description
     * @param {boolean} params.objectParams.include.options If `true` will add a list of field options to the description
     * @param {boolean} params.objectParams.include.private If `true` will ignore ownership considerations when formulating the description
     * @param {string[]} params.objectParams.include.related An array of parent relationship names, which will then include those related objects in the description
     * @param {string[]} params.objectParams.include.extra Some `VingRecord`s may define weird description functions that can be initiated by naming it in this array
     * @param {Object} where A drizzle where clause for filtering the list of records described
     * @returns {object} A paginated list of records
     * @example
     * const list = await Users.describeList()
     */
    async describeList(
        params = {},
        where
    ) {
        const sortMethod = (params.sortOrder == 'desc') ? desc : asc;
        let orderBy = [sortMethod(this.table.createdAt), sortMethod(this.table.id)];
        if (params.sortBy) {
            const cols = [];
            let hasIdSortField = false;
            for (const field of params.sortBy) {
                if (field == 'id') {
                    hasIdSortField = true;
                }
                cols.push(sortMethod(this.table[field]));
            }
            if (!hasIdSortField) {
                cols.push(sortMethod(this.table.id));
            }
            orderBy = cols;
        }
        const itemsPerPage = isUndefined(params?.itemsPerPage) || params?.itemsPerPage > 100 || params?.itemsPerPage < 1 ? 10 : params.itemsPerPage;
        const page = typeof params.page == 'undefined' || params.page < 1 ? 1 : params.page;
        const maxItems = params.maxItems || 100000000000;
        const itemsUpToThisPage = itemsPerPage * page;
        const fullPages = Math.floor(maxItems / itemsPerPage);
        let maxItemsThisPage = itemsPerPage;
        let skipResultSet = false;
        if (itemsUpToThisPage - itemsPerPage >= maxItems) {
            skipResultSet = true;
        }
        else if (page - fullPages == 1) {
            maxItemsThisPage = itemsPerPage - (itemsUpToThisPage - maxItems);
        }
        else if (page - fullPages > 1) {
            skipResultSet = true;
        }
        const totalItems = await this.count(where);
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const out = {
            paging: {
                page: page,
                nextPage: page + 1 >= totalPages ? page : page + 1,
                previousPage: page < 2 ? 1 : page - 1,
                itemsPerPage: itemsPerPage,
                totalItems: totalItems,
                totalPages: totalPages
            },
            items: []
        };
        if (!skipResultSet) {
            const records = await this.findMany(where, { limit: itemsPerPage, offset: itemsPerPage * (page - 1), orderBy: orderBy });
            for (let record of records) {
                out.items.push(await record.describe(params.objectParams));
                maxItemsThisPage--;
                if (maxItemsThisPage < 1) break;
            }
        }
        return out;
    }

    /**
     * A safer version of `delete ` above as it uses `calcWhere()`.
     * 
     * 
     * @param {Object} where a Drizzle where clause
     */
    async deleteMany(
        where,
    ) {
        let query = this.delete.where(this.calcWhere(where));
        await query;
    }

    /**
     * Generates a list of `describeList` filters based upon ving schema. Can be overriden to do fancy filters.
     * 
     * @returns {object} A list of filters
     */
    describeListFilter() {

        const filter = {
            queryable: [],
            ranged: [],//[this.table.createdAt, this.table.updatedAt],
            qualifiers: [],
        };
        const schema = findVingSchema(getTableName(this.table));
        for (const prop of schema.props) {
            if (prop.filterQuery)
                filter.queryable.push({ vingSchemaProp: prop, drizzleColumn: this.table[prop.name] });
            if (prop.filterQualifier)
                filter.qualifiers.push({ vingSchemaProp: prop, drizzleColumn: this.table[prop.name] });
            if (prop.filterRange)
                filter.ranged.push({ vingSchemaProp: prop, drizzleColumn: this.table[prop.name] });
        }
        return filter;
    }

    /**
     * Locates and returns a single record.
     * 
     * @param {string|number} id the unique `id` of the record
     * @returns {VingRecord|undefined} a record or `undefined` if no record is found
     * @example
     * const record = await Users.find('xxx');
     */
    async find(id) {
        try {
            return await this.findOrDie(id);
        } catch {
            return undefined;
        }
    }

    /**
     * Locates and returns a list of records by a drizzle where clause or an empty array if no records are found.
     * 
     * @param {Object} where A drizzle where clause
     * @param {Object} options Modify the sorting and pagination of the results. Defaults to `{ } `
     * @param {number} options.limit The max number of records to to return
     * @param {number} options.offset The number of records to skip before returning results
     * @param {Object[]} options.orderBy An array of drizzle table fields to sort by with `asc()` or `desc()` function wrappers
     * @returns {VingRecord[]} A list of records
     * @example
     * const listOfFredRecords = await Users.findMany(like(Users.table.realName, 'Fred%'));
     */
    async findMany(
        where,
        options = {}
    ) {
        let query = this.select.where(this.calcWhere(where));
        if (options.orderBy)
            query.orderBy(...options.orderBy);
        if (options.limit)
            query.limit(options.limit);
        if (options.offset)
            query.offset(options.offset);
        const results = (await query);
        return results.map(props => new this.recordClass(this.db, this.table, props));
    }

    /**
     * Locates and returns an iterator of records by a drizzle where clause or an empty array if no records are found. This is identical to `findMany`, but returns an iterator rather than a list. Iterators are better for huge datasets.
     * 
     * @param {Object} where A drizzle where clause
     * @param {Object} options Modify the sorting and pagination of the results. Defaults to `{ } `
     * @param {number} options.limit The max number of records to to return
     * @param {number} options.offset The number of records to skip before returning results
     * @param {Object[]} options.orderBy An array of drizzle table fields to sort by with `asc()` or `desc()` function wrappers
     * @returns {Iterator<VingRecord>} An iterator that points to a list of records
     * @example
     * const fredRecords = await Users.findAll(like(Users.table.realName, 'Fred%')); 
     * for await (const fred of fredRecords) { 
     *  // do stuff with each record
     * }
     */
    async * findAll(
        where,
        options = {}
    ) {
        const kind = this;
        let query = this.select.where(this.calcWhere(where));
        if (options.orderBy)
            query.orderBy(...options.orderBy);
        if (options.limit)
            query.limit(options.limit);
        if (options.offset)
            query.offset(options.offset);
        const iterator = await query.iterator();
        for await (const data of iterator) {
            yield new kind.recordClass(kind.db, kind.table, data);
        }
    }

    /**
     * Locates and returns a single record by a drizzle where clause.
     * 
     * @param {Object} where A drizzle where clause
     * @returns {VingRecord|undefined} a record or `undefined` if no record is found
     * @example
     * const fredRecord = await Users.findOne(eq(Users.table.username, 'Fred'));
     */
    async findOne(where) {
        const result = await this.findMany(where, { limit: 1 });
        if (result.length)
            return result[0];
        return undefined;
    }

    /**
     * Locates and returns a single record by it's `id`.
     * 
     * @param {string|number} id the unique `id` of the record
     * @throws 404 if no record is found
     * @returns {VingRecord} a record
     * @example
     * const record = await Users.findOrDie('xxx')
     */
    async findOrDie(id) {
        let field = this.table.id;
        if (!isNumber(id))  // in case we are passed the stringified id
            id = parseId(id);
        const props = (await this.select.where(eq(field, id)))[0];
        if (props)
            return new this.recordClass(this.db, this.table, props);
        const schema = findVingSchema(getTableName(this.table));
        ving.log('VingRecord').error(`${schema.kind} not found finding id ${id}.`);
        throw ving.ouch(404, `${schema.kind} not found.`, { id })
    }

    /**
     * Create a new record from scratch. Note that this does not save to the database, you'll need to call `insert()` on it to do that.
     * 
     * @param {Object} props The list of props to initialize the record
     * @returns {VingRecord} A newly minted record
     * @example
     * const user = Users.mint({username: 'andy'})
     */
    mint(props) {
        const output = {};
        for (const item of this.propDefaults) {
            output[item.prop] = item.value;
        }
        for (const prop of findVingSchema(getTableName(this.table)).props) {
            if (props && !isUndefined(props[prop.name]))
                output[prop.name] = props[prop.name]
            else if (!isUndefined(output[prop.name])) // the value was set above
                continue;
            else if (prop.type == 'string' || prop.type == 'enum')
                output[prop.name] = stringDefault(prop)
            else if (prop.type == 'boolean')
                output[prop.name] = booleanDefault(prop)
            else if (prop.type == 'int')
                output[prop.name] = numberDefault(prop)
            else if (prop.type == 'date')
                output[prop.name] = dateDefault(prop)
            else if (prop.type == 'id')
                if (prop.required)
                    output[prop.name] = stringDefault(prop)
                else
                    output[prop.name] = prop.default || null;
        }
        return new this.recordClass(this.db, this.table, output, false);
    }

}