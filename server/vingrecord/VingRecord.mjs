import { vingSchemas } from '../vingschema/index.mjs';
import { findObject } from './../utils/findObject.mjs';
import { ouch } from './../utils/ouch.mjs';
import _ from 'lodash';
import { eq, asc, desc, and, ne, sql, getTableName } from '../drizzle/orm.mjs';
import { stringDefault, booleanDefault, numberDefault, dateDefault } from '../vingschema/helpers.mjs';

/**
 * Get the schema for a specific kind within the ving schema list.
 * 
 * Usage: `const schema = findVingSchema('User')`
 * 
 * @param nameToFind The table name.
 * @param by Can be `kind` or `tableName`.
 * @returns A ving kind schema.
 */
export const findVingSchema = (nameToFind = '-unknown-', by = 'tableName') => {
    try {
        return findObject(by, nameToFind, vingSchemas);
    }
    catch {
        throw ouch(404, 'ving schema ' + nameToFind + ' not found');
    }
}

/**
 * 
 * @param enums Creates a select list options datastructure from the `enums` and `enumLabels` on a ving schema.
 * 
 * Usage: `const options = enum2options([true,false], ['Is Admin','Is Not Admin'])`
 * 
 * @param enums An array of enumerated values
 * @param labels An array of enumerated labels
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
 * @param name The name of the prop you are looking for
 * @param props The list of schema props to search in
 * @returns The prop object
 */
export const findPropInSchema = (name, props) => {
    return props.find(prop => prop.name == name);
}

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
     * Constructor. You'll almost never call this directly, but instead it will be called by a subclass of VingKind.
     * 
     * Usage: `const user = new UserRecord(db, UsersTable)`
     * 
     * @param db A mysql2 database connection or pool
     * @param table The drizzle database table definition
     * @param props Initializers for props
     * @param inserted Whether or not the record already exists in the database
     */
    constructor(db, table, props, inserted = true) {
        this.#props = props;
        this.#inserted = inserted;
        this.db = db;
        this.table = table;
    }

    /**
     * Add a warning to the `warnings` list
     * 
     * Usage: `user.addWarning({code: 404, message:'Brain not found.'})`
     * 
     * @param warning A warning object that has a `code`, and a `message`
     */
    addWarning(warning) {
        this.warnings?.push(warning);
    }

    /**
     * The same as `isOwner` except throws a `403` error instead of returning `false`
     * 
     * Usage: `apikey.canEdit(session)`
     * 
     * @param currentUser A `User` or `Session`
     * @returns Returns `true` or throws a `403` error
     */
    canEdit(currentUser) {
        if (this.isOwner(currentUser)) {
            return true;
        }
        const schema = findVingSchema(getTableName(this.table));
        throw ouch(403, `You do not have the privileges to access ${schema.kind}.`)
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
     * @param params A list of params to change the output of the describe
     * @returns Serialized version of the record
     */
    async describe(params = {}) {
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);
        const schema = findVingSchema(getTableName(this.table));
        let out = { props: {} };
        out.props.id = this.get('id');
        if (include !== undefined && include.links) {
            out.links = { base: `/api/${schema.kind?.toLowerCase()}` };
            out.links.self = `${out.links.base}/${this.#props.id}`;
        }
        if (include !== undefined && include.options) {
            out.options = this.propOptions(params);
        }
        if (include !== undefined && include.meta) {
            out.meta = {
                kind: schema.kind,
                isOwner: isOwner,
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
            ) {
                let lower = field.relation.name.toLowerCase();
                out.links[lower] = `${out.links.self}/${lower}`;
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
     * @param key The name of the prop
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
            throw ouch(409, `${schema.kind} already inserted`);
        }
        this.#inserted = true;
        await this.db.insert(this.table).values(this.#props);
    }

    /**
     * Determine whether a user owns the current record. 
     * 
     * Usage: `const owner = apikey.isOwner(session)`
     * 
     * @param currentUser A `User` or `Session`
     * @returns Whether or not the passed in user owns this record or not
     */
    isOwner(currentUser) {
        if (currentUser === undefined)
            return false;
        const schema = findVingSchema(getTableName(this.table));
        for (let owner of schema.owner) {
            let found = owner.match(/^\$(.*)$/);
            if (found) {
                if (this.#props[found[1]] == currentUser.getRoleProp('id')) {
                    return true;
                }
            }
            found = owner.match(/^([A-Za-z]+)$/);
            if (found) {
                if (found[1] && currentUser.isRole(found[1]) == true) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns a record related to this record by relationship name
     * 
     * Usage: `const user = apikey.parent('user')`
     * 
     * @param name The relationship name
     * @returns A record related to the this record
     */
    parent(name) {
        try {
            return this[name]
        }
        catch {
            const schema = findVingSchema(getTableName(this.table))
            throw ouch(404, `Couldn't find parent "${name}" on ${schema.kind}.`);
        }
    }

    /**
     * Returns a list of the enumerated prop options available to the current user
     * 
     * Usage: `const options = user.propOptions({currentUser: session})`
     * 
     * @param params The same params as `describe`
     * @param all Include all options regardless of the `currentUser`
     * @returns a list of the enumerated prop options
     */
    propOptions(params = {}, all = false) {
        const options = {};
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);
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
     * Fetches the props from the database and overwrites whats in memory
     * 
     * @returns the same as `getAll()`
     */
    async refresh() {
        return this.#props = (await this.db.select().from(this.table).where(eq(this.table.id, this.#props.id)))[0];
    }

    /**
     * Assign a value to a prop
     * 
     * Usage: `user.set('username', 'andy')`
     * 
     * @param key The name of the prop
     * @param value The value to set
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
                    throw ouch(442, key.toString() + ': ' + formatted._errors.join('.') + '.', key);
                }
            }
        }
        else {
            throw ouch(400, key.toString() + ' is not a prop', key);
        }
        return this.#props[key] = value;
    }

    /**
     * Set a subset of values of a record.
     * 
     * Usage: `user.setAll({ username : 'andy' })`
     * 
     * @param props An object containing name/value pairs to set. Doesn't need to be a complete list of all values.
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
     * @param params A list of props to be set
     * @param currentUser A `User` or `Session`
     * @returns `true` if set, or an exception if it couldn't be
     */
    async setPostedProps(params, currentUser) {
        const schema = findVingSchema(getTableName(this.table));
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);

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
                throw ouch(441, `${fieldName} is required.`, fieldName);
            }
            if (field.name !== undefined && param !== undefined) {
                if (field.unique) {
                    const query = this.db.select({ count: sql`count(*)`.as('count') }).from(this.table);
                    let where = eq(this.table[field.name], params[field.name]);
                    if (this.isInserted)
                        where = and(where, ne(this.table.id, this.get('id')));

                    let count = (await query.where(where))[0].count
                    if (count > 0) {
                        console.log('--- unique check failed ---', fieldName)
                        throw ouch(409, `${field.name.toString()} must be unique, but ${params[field.name]} has already been used.`, field.name)
                    }
                }
                if (param !== null) {
                    this.set(field.name, param);
                    if (field.relation && field.relation.type == 'parent') {
                        const parent = await this.parent(field.relation.name);
                        parent.canEdit(currentUser);
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
     * @param params A list of props to be set
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
            throw ouch(441, `${fieldName} is required.`, fieldName);
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
     * @param params props to update
     * @param currentUser A `User` or `Session`
     */
    async updateAndVerify(params, currentUser) {
        await this.setPostedProps(params, currentUser);
        await this.update();
    }
}

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

    /** Constructor
     * 
     * Usage: `const users = UserKind(db, UsersTable, UserRecord)`
     * 
     * @param db A mysql2 database connection or pool
     * @param table A drizzle table definition
     * @param recordClass a reference to the record class to instanciate upon fetching or creating records from this kind
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
     * @param where A drizzle where clause
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
     * Creates a new record based upon the props of an old one. Note that this doesn't save the new record to the database, you'll need to call `insert()` on it to do that.
     * 
     * Usage: `const newRecord = Users.copy(user.getAll())`
     * 
     * @param originalProps a list of props to be copied
     * @returns a newly minted record based upon the original props
     */
    copy(originalProps) {
        let props = { ...originalProps };
        delete props.id;
        delete props.createdAt;
        return this.mint(props);
    }

    /**
     * Get the number of records of this kind
     * 
     * Usage: `const numberOfUsers = await Users.count()`
     * 
     * @param where A drizzle where clause
     * @returns A count of the records
     */
    async count(where) {
        return (await this.db.select({ count: sql`count(*)`.as('count') }).from(this.table).where(this.calcWhere(where)))[0].count;
    }

    /**
     * Creates a new record in the database. This is the same as calling `mint` and then `insert` on the minted record.
     * 
     * Usage: `const record = Users.create({username: 'andy'})`
     * 
     * @param props The list of props to add to this record
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
     * @param props A list of props
     * @param currentUser A `User` or `Session`
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
     * @param params Change the output of what is described
     * @param where A drizzle where clause for filtering the list of records described
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
     * @param where a Drizzle where clause
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
     * @param id The unique id of the record
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
     * @param where A drizzle where clause
     * @param options Modify the sorting and pagination of the results
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
     * Locates and returns a single record by a drizzle where clause.
     * 
     * Usage: `const fredRecord = await Users.findOne(eq(Users.username, 'Fred'));`
     * 
     * @param where A drizzle where clause
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
     * @param id the unique id of the record
     * @returns a record or throws a `404` error if no record is found.
     */
    async findOrDie(id) {
        const props = (await this.select.where(eq(this.table.id, id)))[0];
        if (props)
            return new this.recordClass(this.db, this.table, props);
        const schema = findVingSchema(getTableName(this.table));
        throw ouch(404, `${schema.kind} not found.`, { id })
    }

    /**
     * Create a new record from scratch. Note that this does not save to the database, you'll need to call `insert()` on it to do that.
     * 
     * Usage: `const record = Users.mint({username: 'andy'})`
     * 
     * @param props The list of props to initialize the record
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