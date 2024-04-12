import { findVingSchema } from '#ving/schema/map.mjs';
import ving from '#ving/index.mjs';
import _ from 'lodash';
import { eq, asc, desc, and, ne, sql, getTableName, count, sum, avg, min, max } from '#ving/drizzle/orm.mjs';
import { stringDefault, booleanDefault, numberDefault, dateDefault } from '#ving/schema/helpers.mjs';

/**
 * Creates a select list options datastructure from the `enums` and `enumLabels` on a ving schema.
 * 
 * Usage: `const options = enum2options([true,false], ['Is Admin','Is Not Admin'])`
 * 
 * @param {string[]} enums An array of enumerated values
 * @param {string[]} labels An array of enumerated labels
 * @returns An array of objects that combines enums and labels into an object with attributes of `label` and `value`
 */
export const enum2options = (enums, labels) => {
    const options = [];
    let i = 0
    for (let value of enums) {
        const label = (labels !== undefined && labels[i] !== undefined) ? labels[i] : value.toString();
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
 * Usage: `findPropInSchema('useAsDisplayName', [])`
 * 
 * @param {string} name The name of the prop you are looking for
 * @param {Object[]} props The list of schema props to search in
 * @returns The prop object
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
     * Usage: `const user = new UserRecord(db, UsersTable)`
     * 
     * @param {Object} db A mysql2 database connection or pool
     * @param {string} table The drizzle database table definition
     * @param {Object} props Initializers for props
     * @param {boolean} inserted Whether or not the record already exists in the database
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
     * Usage: `user.addWarning({code: 404, message:'Brain not found.'})`
     * 
     * @param {Object} warning A warning object that has a `code`, and a `message`
     * @param {number} warning.code A 3 digit error code
     * @param {string} warning.message A human readable message
     */
    addWarning(warning) {
        this.warnings?.push(warning);
    }

    /**
     * The same as `isOwner` except throws a `403` error instead of returning `false`
     * 
     * Usage: `await apikey.canEdit(session)`
     * 
     * @param {Object} currentUser A `User` or `Session`
     * @throws 403
     * @returns {boolean} Returns `true`
     */
    async canEdit(currentUser) {
        if (await this.isOwner(currentUser)) {
            return true;
        }
        const schema = findVingSchema(getTableName(this.table));
        throw ving.ouch(403, `You do not have the privileges to access ${schema.kind}.`)
    }

    /**
     * Creates a new record based upon the props of an old one. Note that this doesn't save the new record to the database, you'll need to call `insert()` on it to do that.
     * 
     * Usage: `const newRecord = this.copy()`
     * 
     * @returns {Object} a newly minted record based upon the original props
     */
    async copy() {
        const schema = findVingSchema(getTableName(this.table));
        const kind = await ving.useKind(schema.kind);
        let props = { ...this.getAll() };
        delete props.id;
        delete props.createdAt;
        return kind.mint(props);
    }

    /**
     * Removes the record from the database
     * 
     * Usage: `await user.delete()`
     */
    async delete() {
        this.#deleted = true;
        await this.db.delete(this.table).where(eq(this.table.id, this.#props.id));
    }

    /**
     * Serialize the information about this record in a permission sensitive way
     * 
     * Usage: `const description = await user.describe({currentUser: session})`
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
     * 
     * @returns Serialized version of the `VingRecord`
     */
    async describe(params = {}) {
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && await this.isOwner(currentUser);
        const schema = findVingSchema(getTableName(this.table));
        let out = { props: {} };
        out.props.id = this.get('id');
        if (include !== undefined && include.links) {
            const vingConfig = await ving.getConfig();
            out.links = { base: { href: `/api/${vingConfig.rest.version}/${schema.kind?.toLowerCase()}`, methods: ['GET', 'POST'] } };
            out.links.self = { href: `${out.links.base.href}/${this.#props.id}`, methods: ['GET', 'PUT', 'DELETE'] };
        }
        if (include !== undefined && include.options) {
            out.options = await this.propOptions(params);
        }
        if (include !== undefined && include.meta) {
            out.meta = {
                kind: schema.kind,
                isOwner,
            };
            if (this.#deleted) {
                out.meta.deleted = true;
            }
        }
        if (include !== undefined && include.related && include.related.length) {
            out.related = {};
        }
        if (this.warnings?.length) {
            out.warnings = this.warnings;
        }

        for (const field of schema.props) {

            // determine field visibility
            const roles = [...field.view, ...field.edit];
            const visible = roles.includes('public')
                || (include !== undefined && include.private)
                || (roles.includes('owner') && isOwner)
                || (currentUser !== undefined && currentUser.isaRole(roles));
            if (!visible) continue;

            const fieldName = field.name.toString();

            // props
            out.props[field.name] = this.#props[field.name];

            // links 
            if (typeof out.links === 'object'
                && include.links
                && field.relation
                && typeof out.links.self === 'object'
            ) {
                let lower = field.relation.name.toLowerCase();
                out.links[lower] = { href: `${out.links.self.href}/${lower}`, methods: ['GET'] };
            }

            // related
            if (typeof out.related === 'object'
                && include.related !== undefined
                && field.relation
                && ['parent', 'sibling'].includes(field.relation.type)
                && include.related.includes(field.relation.name)
            ) {
                const parent = await this.parent(field.relation.name);
                out.related[field.relation.name] = await parent.describe(params);
            }

        }

        return out;
    }

    /**
     * Retrieve the value of a prop from this record
     * 
     * Usage: `const value = user.get('id')`
     * 
     * @param {string} key The name of the prop
     * @returns A value
     */
    get(key) {
        return this.#props[key];
    }

    /**
     * 
     * @returns Retrieve an object of name/value pairs from this record
     * 
     * Usage: `const props = user.getAll()`
     * 
     * @returns An object of name/value pairs
     */
    getAll() {
        return this.#props;
    }

    /**
     * Inserts the current record into the database
     * 
     * Usage: `await user.insert()`
     */
    async insert() {
        if (this.#inserted) {
            const schema = findVingSchema(getTableName(this.table));
            throw ving.ouch(409, `${schema.kind} already inserted`);
        }
        this.#inserted = true;
        await this.db.insert(this.table).values(this.#props);
    }

    /**
     * Determine whether a user owns the current record. 
     * 
     * Usage: `const owner = await apikey.isOwner(session)`
     * 
     * @param {Object} currentUser A `User` or `Session`
     * @returns Whether or not the passed in user owns this record or not
     */
    async isOwner(currentUser) {
        if (currentUser === undefined)
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
     * Usage: `const user = await apikey.parent('user')`
     * 
     * @param {string} name The relation name
     * @throws 404 if it can't find the parent by name
     * @returns A record related to the this record
     */
    async parent(name) {
        if (name in this.#parentCache)
            return this.#parentCache[name];
        const schema = findVingSchema(getTableName(this.table));
        const prop = ving.findObject(schema.props, obj => obj.relation?.name == name);
        return this.#parentCache[name] = await (await ving.useKind(prop.relation.kind)).findOrDie(this.get(prop.name));
    }

    /**
     * Flushes the parent cache created by calling the `parent()` method.
     * 
     * Usage: `apikey.flushParentCache()`
     */
    flushParentCache() {
        this.#parentCache = {};
    }


    /**
     * Returns a query to fetch the children of a child relationship attached to this kind's schema.
     * 
     * Usage: `const apikeys = await user.children('apikeys')
     * 
     * @param {string} name The relation name
     * @throws 404 if it can't find the children by name
     * @returns A drizzle query.
     */
    async children(name) {
        const schema = findVingSchema(getTableName(this.table));
        const prop = ving.findObject(schema.props, obj => obj.relation?.name == name);
        const kind = await ving.useKind(prop.relation.kind);
        if (kind.table[prop.name] == undefined)
            ving.log('VingRecord').error(`${schema.kind} has an invalid virtual prop name called ${name}`);
        kind.propDefaults.push({
            prop: prop.name,
            field: kind.table[prop.name],
            value: this.get('id'),
        });
        return kind;
    }

    /**
     * Returns a list of the enumerated prop options available to the current user
     * 
     * Usage: `const options = await user.propOptions({currentUser: session})`
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
     * @param {boolean} all Include all options regardless of the `currentUser`. Defaults to `false`.
     * @returns a list of the enumerated prop options
     */
    async propOptions(params = {}, all = false) {
        const options = {};
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && await this.isOwner(currentUser);
        for (const prop of findVingSchema(getTableName(this.table)).props) {
            const roles = [...prop.view, ...prop.edit];
            const visible = roles.includes('public')
                || (include !== undefined && include.private)
                || (roles.includes('owner') && (isOwner || all))
                || (currentUser !== undefined && currentUser.isaRole(roles));
            if (!visible)
                continue;
            if ((prop.type == 'enum' || prop.type == 'boolean') && prop.enums && prop.enums.length > 0) {
                options[prop.name] = enum2options(prop.enums, prop.enumLabels);
            }
        }
        return options;
    }

    /**
     * Fetches the props from the database and overwrites whats in memory. Also flushes the parent relation cache.
     * 
     * @returns the same as `getAll()`
     */
    async refresh() {
        this.flushParentCache();
        return this.#props = (await this.db.select().from(this.table).where(eq(this.table.id, this.#props.id)))[0];
    }

    /**
     * Assign a value to a prop
     * 
     * Usage: `user.set('username', 'andy')`
     * 
     * @param {string} key The name of the prop
     * @param {*} value The value to set
     * @returns The value that was set
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
                    throw ving.ouch(442, key.toString() + ': ' + formatted._errors.join('.') + '.', key);
                }
            }
            if (prop?.relation?.type == 'parent')
                this.flushParentCache();
        }
        else {
            throw ving.ouch(400, key.toString() + ' is not a prop', key);
        }
        return this.#props[key] = value;
    }

    /**
     * Set a subset of values of a record.
     * 
     * Usage: `user.setAll({ username : 'andy' })`
     * 
     * @param {Object} props An object containing name/value pairs to set. Doesn't need to be a complete list of all values.
     * @returns The same as `getAll()`
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
     * Usage: `await user.setPostedProps({username: 'andy'}, session)`
     * 
     * @param {Object} params A list of props to be set
     * @param {Object} currentUser A `User` or `Session`
     * @throws 441 if a required field isn't set
     * @throws 409 if a unique constraint fails
     * @returns `true` if set, or an exception if it couldn't be
     */
    async setPostedProps(params, currentUser) {
        const schema = findVingSchema(getTableName(this.table));
        const isOwner = currentUser !== undefined && await this.isOwner(currentUser);

        for (const field of schema.props) {
            const fieldName = field.name.toString();
            const param = params[field.name];
            const roles = [...field.edit];
            const editable = (roles.includes('owner') && (isOwner || !this.isInserted))
                || (currentUser !== undefined && currentUser.isaRole(roles));
            if (!editable) {
                continue;
            }
            if (param === undefined || (field.relation && field.relation.type != 'parent')) {
                continue;
            }
            if (param === '' && field.required) {
                throw ving.ouch(441, `${fieldName} is required.`, fieldName);
            }
            if (field.name !== undefined && param !== undefined) {
                if (field.unique) {
                    const query = this.db.select({ count: sql`count(*)`.as('count') }).from(this.table);
                    let where = eq(this.table[field.name], params[field.name]);
                    if (this.isInserted)
                        where = and(where, ne(this.table.id, this.get('id')));

                    let count = (await query.where(where))[0].count
                    if (count > 0) {
                        ving.log('VingRecord').warning(`${this.get('id')} unique check failed on ${field.name.toString()}`)
                        throw ving.ouch(409, `${field.name.toString()} must be unique, but ${params[field.name]} has already been used.`, field.name)
                    }
                }
                if (param !== null) {
                    this.set(field.name, param);
                    if (field.relation && field.relation.type == 'parent') {
                        const parent = await this.parent(field.relation.name);
                        if (!field.relation.skipOwnerCheck)
                            await parent.canEdit(currentUser);
                    }
                }

            }
        }
        return true;
    }

    /**
     * Verifies that the record has valid and required info to be created in the database
     * 
     * Usage: `user.testCreationProps({username: 'andy'})`
     * 
     * @param {Object} params A list of props to be set
     * @throws 441 if a required field isn't set
     * @returns `true` if all the required params exist and validate or an exception if not
     */
    testCreationProps(params) {
        const schema = findVingSchema(getTableName(this.table));
        for (const prop of schema.props) {
            if (!prop.required || prop.type == 'virtual' || (prop.default !== undefined && prop.default !== '') || prop.relation)
                continue;
            if (params[prop.name] !== undefined && params[prop.name] != '')
                continue;
            const fieldName = prop.name.toString();
            throw ving.ouch(441, `${fieldName} is required.`, fieldName);
        }
        return true;
    }

    /**
     * Overwrites the record in the database with the values currently in memory
     * 
     * Usage: `await user.update()`
     */
    async update() {
        const schema = findVingSchema(getTableName(this.table));
        // auto-update auto-updating date fields
        for (const field of schema.props) {
            if (field.type == 'date' && field.autoUpdate) {
                this.#props[field.name] = new Date();
            }
        }
        await this.db.update(this.table).set(this.#props).where(eq(this.table.id, this.#props.id));
    }

    /**
     * A permission safe way to update the props of a record. Calls `setPostedProps` then `update`.
     * 
     * Usage: `await user.updateAndVerify({username:'andy'}, session)`
     * 
     * @param {Object} params props to update
     * @param {Object} currentUser A `User` or `Session`
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
     * Usage: `const users = UserKind(db, UsersTable, UserRecord)`
     * 
     * @param {Object} db A mysql2 database connection or pool
     * @param {Object} table A drizzle table definition
     * @param {Object} recordClass a reference to the record class to instanciate upon fetching or creating records from this kind
     */
    constructor(db, table, recordClass) {
        this.db = db;
        this.table = table;
        this.recordClass = recordClass;
    }

    /**
     * Adds `propDefaults` (if any) into a where clause to limit the scope of affected records. As long as you're using the built in queries you don't need to use this method. But you might want to use it if you're using `create`, `select`, `update`, or `delete` directly.
     * 
     * Usage: `const results = await Users.delete.where(Users.calcWhere(like(Users.realName, 'Fred%')));`
     * 
     * @param {Object} where A drizzle where clause
     * @returns A drizzle where clause
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
     * Usage: `const numberOfUsers = await Users.count()`
     * 
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     */
    async count(where) {
        return (await this.db.select({ value: count() }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
     * Sum the values of a field of this kind
     * 
     * Usage: `await S3Files.sum('sizeInBytes')`
     * 
     * @param {string} field The name of the column to sum
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     */
    async sum(field, where) {
        return (await this.db.select({ value: sum(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
     * Average the values of a field of this kind
     * 
     * Usage: `await S3Files.avg('sizeInBytes')`
     * 
     * @param {string} field The name of the column to average
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     */
    async avg(field, where) {
        return (await this.db.select({ value: avg(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
     * Get the minimum value for a field of this kind
     * 
     * Usage: `await S3Files.min('sizeInBytes')`
     * 
     * @param {string} field The name of the column to get the minimum
     * @param {Object} where A drizzle where clause
     * @returns {number} A count of the records
     */
    async min(field, where) {
        return (await this.db.select({ value: min(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
    * Get the maximum value for a field of this kind. 
    * 
    * Usage: `await S3Files.max('sizeInBytes')`
    * 
    * @param {string} field The name of the column to get the maximum
    * @param {Object} where A drizzle where clause
    * @returns {number} A count of the records
    */
    async max(field, where) {
        return (await this.db.select({ value: max(this.table[field]) }).from(this.table).where(this.calcWhere(where)))[0].value;
    }

    /**
     * Creates a new record in the database. This is the same as calling `mint` and then `insert` on the minted record.
     * 
     * Usage: `const record = Users.create({username: 'andy'})`
     * 
     * @param {Object} props The list of props to add to this record
     * @returns A newly minted record
     */
    async create(props) {
        const obj = this.mint(props);
        await obj.insert();
        return obj;
    }

    /**
     * Creates a new record in the database in a permission safe way. This is the same as calling `mint`, then `testCreationProps` then `setPostedProps`, then `insert`.
     * 
     * Usage: `const record = await Users.createAndVerify({username: 'andy'})`
     *
     * @param {Object} props A list of props
     * @param {Object} currentUser A `User` or `Session`
     * @returns A newly minted record or throws an error if validation fails
     */
    async createAndVerify(props, currentUser) {
        const obj = this.mint({});
        obj.testCreationProps(props);
        await obj.setPostedProps(props, currentUser);
        await obj.insert();
        return obj;
    }

    /**
     * Format a privilege safe paginated list of records
     * 
     * Usage: `const list = await Users.describeList()`
     * 
     * @param {Object} params A list of params to change the output of the describe. Defaults to `{}`
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
     * @returns A paginated list of records
     */
    async describeList(
        params = {},
        where
    ) {
        const sortMethod = (params.sortOrder == 'desc') ? desc : asc;
        let orderBy = [sortMethod(this.table.createdAt)];
        if (params.sortBy) {
            const cols = [];
            for (const field of params.sortBy) {
                cols.push(sortMethod(this.table[field]));
            }
            orderBy = cols;
        }
        const itemsPerPage = params.itemsPerPage === undefined || params.itemsPerPage > 100 || params.itemsPerPage < 1 ? 10 : params.itemsPerPage;
        const page = params.page || 1;
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
     * A safer version of `delete` above as it uses `calcWhere()`.
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
     * @returns A list of filters
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
                filter.queryable.push(this.table[prop.name]);
            if (prop.filterQualifier)
                filter.qualifiers.push(this.table[prop.name]);
            if (prop.filterRange)
                filter.ranged.push(this.table[prop.name]);
        }
        return filter;
    }

    /**
     * Locates and returns a single record by it's `id`.
     * 
     * Usage: `const record = await Users.find('xxx');`
     * 
     * @param {string} id The unique id of the record
     * @returns a record or `undefined` if no record is found
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
     * Usage: `const listOfFredRecords = await Users.findMany(like(Users.realName, 'Fred%'));`
     * 
     * @param {Object} where A drizzle where clause
     * @param {Object} options Modify the sorting and pagination of the results. Defaults to `{}`
     * @param {number} options.limit The max number of records to to return
     * @param {number} options.offset The number of records to skip before returning results
     * @param {Object[]} options.orderBy An array of drizzle table fields to sort by with `asc()` or `desc()` function wrappers
     * @returns A list of records
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
     * Usage: `const fredRecords = await Users.findAll(like(Users.realName, 'Fred%')); for await (const fred of fredRecords) { }`
     * 
     * @param {Object} where A drizzle where clause
     * @param {Object} options Modify the sorting and pagination of the results. Defaults to `{}`
     * @param {number} options.limit The max number of records to to return
     * @param {number} options.offset The number of records to skip before returning results
     * @param {Object[]} options.orderBy An array of drizzle table fields to sort by with `asc()` or `desc()` function wrappers
     * @returns An iterator that points to a list of records
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
     * Usage: `const fredRecord = await Users.findOne(eq(Users.username, 'Fred'));`
     * 
     * @param {Object} where A drizzle where clause
     * @returns a record or `undefined` if no record is found
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
     * Usage: `const record = await Users.findOrDie('xxx')`
     * 
     * @param {string} id the unique id of the record
     * @throws 404 if no record is found
     * @returns a record
     */
    async findOrDie(id) {
        const props = (await this.select.where(eq(this.table.id, id)))[0];
        if (props)
            return new this.recordClass(this.db, this.table, props);
        const schema = findVingSchema(getTableName(this.table));
        throw ving.ouch(404, `${schema.kind} not found.`, { id })
    }

    /**
     * Create a new record from scratch. Note that this does not save to the database, you'll need to call `insert()` on it to do that.
     * 
     * Usage: `const record = Users.mint({username: 'andy'})`
     * 
     * @param {Object} props The list of props to initialize the record
     * @returns A newly minted record
     */
    mint(props) {
        const output = {};
        for (const item of this.propDefaults) {
            output[item.prop] = item.value;
        }
        for (const prop of findVingSchema(getTableName(this.table)).props) {
            if (props && props[prop.name] !== undefined)
                output[prop.name] = props[prop.name]
            else if (prop.type == 'string' || prop.type == 'enum')
                output[prop.name] = stringDefault(prop)
            else if (prop.type == 'boolean')
                output[prop.name] = booleanDefault(prop)
            else if (prop.type == 'number')
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