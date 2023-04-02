import { ModelMap, Roles, ExtendedRoleOptions, ModelName, vingSchema, vingProp, ModelSelect, ModelInsert, Describe, warning, AuthorizedUser, DescribeParams, DescribeListParams, vingOption, DescribeList, Constructable } from '../../types';
import { vingSchemas } from '../vingschema';
import { findObject, ouch } from '../helpers';
import _ from 'lodash';
import { MySql2Database, like, eq, asc, desc, and, or, ne, SQL, sql, Name, AnyMySqlColumn } from '../../server/drizzle/orm';
import { stringDefault, booleanDefault, numberDefault, dateDefault } from '../vingschema/helpers';

export const findVingSchema = (nameToFind: string = '-unknown-') => {
    try {
        return findObject('tableName', nameToFind, vingSchemas) as vingSchema;
    }
    catch {
        throw ouch(404, 'ving schema ' + nameToFind + ' not found');
    }
}

export const enum2options = (enums: readonly string[] | readonly boolean[], labels: string[] | undefined) => {
    const options: vingOption[] = [];
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

export const findPropInSchema = (name: string | number | symbol, props: vingProp[]) => {
    return props.find(prop => prop.name == name);
}

export class VingRecord<T extends ModelName> {
    constructor(public db: MySql2Database, public table: ModelMap[T]['model'], private props: ModelMap[T]['select'], private inserted = true) { }

    private deleted = false;

    public warnings: Describe<T>['warnings'] = [];

    public addWarning(warning: warning) {
        this.warnings?.push(warning);
    }

    public get<K extends keyof ModelSelect<T>>(key: K): ModelSelect<T>[K] {
        return this.props[key];
    }

    public getAll() {
        return this.props;
    }

    public set<K extends keyof ModelSelect<T>>(key: K, value: ModelSelect<T>[K]) {
        const schema = findVingSchema(this.table[Name]);
        const prop = findPropInSchema(key, schema.props);
        if (prop) {
            if (prop.zod) {
                const result = prop.zod(prop as never).safeParse(value);
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
        return this.props[key] = value;
    }

    public setAll(props: Partial<ModelSelect<T>>) {
        const schema = findVingSchema(this.table[Name]);
        for (const key in props) {
            const field = findPropInSchema(key, schema.props)
            if (!field?.noSetAll)
                this.set(key, props[key] as any);
        }
        return this;
    }

    public(props: ModelInsert<T>): ModelSelect<T> {
        const schema = findVingSchema(this.table[Name]);
        for (const key in props) {
            const field = findPropInSchema(key, schema.props)
            if (!field?.noSetAll)
                this.set(key, this.props[key]);
        }
        return this.props;
    }

    public get isInserted() {
        return this.inserted;
    }

    public async insert() {
        if (this.inserted) {
            const schema = findVingSchema(this.table[Name]);
            throw ouch(409, `${schema.kind} already inserted`);
        }
        this.inserted = true;
        await this.db.insert(this.table).values(this.props);
    }

    public async update() {
        await this.db.update(this.table).set(this.props).where(eq(this.table.id, this.props.id));
    }

    public async delete() {
        this.deleted = true;
        await this.db.delete(this.table).where(eq(this.table.id, this.props.id));
    }

    public async refresh() {
        return this.props = (await this.db.select().from(this.table).where(eq(this.table.id, this.props.id)))[0] as ModelSelect<T>;
    }

    public isOwner(currentUser: AuthorizedUser) {
        if (currentUser === undefined)
            return false;
        const schema = findVingSchema(this.table[Name]);
        for (let owner of schema.owner) {
            let found = owner.match(/^\$(.*)$/);
            if (found) {
                if (this.props[found[1] as keyof ModelSelect<T>] == currentUser.getRoleProp('id')) {
                    return true;
                }
            }
            found = owner.match(/^([A-Za-z]+)$/);
            if (found) {
                if (found[1] && currentUser.isRole(found[1] as keyof Roles) == true) {
                    return true;
                }
            }
        }
        return false;
    }

    public canEdit(currentUser: AuthorizedUser) {
        if (this.isOwner(currentUser)) {
            return true;
        }
        const schema = findVingSchema(this.table[Name]);
        throw ouch(403, `You do not have the privileges to access ${schema.kind}.`)
    }

    public async describe(params: DescribeParams = {}) {
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);
        const schema = findVingSchema(this.table[Name]);

        let out: Describe<T> = { props: {} };
        out.props.id = this.get('id');
        if (include !== undefined && include.links) {
            out.links = { base: `/api/${schema.kind?.toLowerCase()}` };
            out.links.self = `${out.links.base}/${this.props.id}`;
        }
        if (include !== undefined && include.options) {
            out.options = this.propOptions(params);
        }
        if (include !== undefined && include.meta) {
            out.meta = {
                kind: schema.kind,
            };
            if (this.deleted) {
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
            out.props[field.name as keyof Describe<T>['props']] = this.props[field.name as keyof ModelInsert<T>];

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
                && include.related !== undefined && include.related.length > 0
                && field.relation
                && include.related.includes(fieldName)
            ) {
                //  if (field.relationFromFields.length > 0) { // parent relationship
                //need to handle related differently, probably by consumers adding their own related processors
                //         let parent = await this[field.name as keyof this] as VingRecord<T>;
                //       out.related[fieldName] = await parent.describe({ currentUser: currentUser })
                //  }
            }
            /*   if (typeof out.related === 'object'
                   && include.relatedList !== undefined && include.relatedList.length > 0
                   && field.relationName
                   && include.relatedList.includes(fieldName)
               ) {
                   if (field.relationFromFields.length == 0) { // child relationship
                       let childKind = this[field.name as keyof this] as VingKind<T, this>;
                       out.relatedList[fieldName] = await childKind.describeList({ objectParams: { currentUser: currentUser } })
                   }
               }*/

        }

        return out;
    }

    public propOptions(params: DescribeParams = {}, all = false) {
        const options: Describe<T>['options'] = {};
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);
        for (const prop of findVingSchema(this.table[Name]).props) {
            const roles = [...prop.view, ...prop.edit];
            const visible = roles.includes('public')
                || (include !== undefined && include.private)
                || (roles.includes('owner') && (isOwner || all))
                || (currentUser !== undefined && currentUser.isaRole(roles));
            if (!visible)
                continue;
            if ((prop.type == 'enum' || prop.type == 'boolean') && prop.enums && prop.enums.length > 0) {
                options[prop.name as keyof ModelInsert<T>] = enum2options(prop.enums, prop.enumLabels);
            }
        }
        return options;
    }

    public testCreationProps(params: ModelInsert<T>) {
        const schema = findVingSchema(this.table[Name]);
        for (const prop of schema.props) {
            if (!prop.required || (prop.default !== undefined && prop.default !== '') || prop.relation)
                continue;
            // @ts-ignore - vingSchema 
            if (params[prop.name] !== undefined && params[prop.name] != '')
                continue;
            const fieldName = prop.name.toString();
            throw ouch(441, `${fieldName} is required.`, fieldName);
        }
        return true;
    }

    public async setPostedProps(params: ModelInsert<T>, currentUser?: AuthorizedUser) {
        const schema = findVingSchema(this.table[Name]);
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);

        for (const field of schema.props) {
            const fieldName = field.name.toString();
            // @ts-ignore - vingSchema is a safe bet
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
                    const query = this.db.select({ count: sql<number>`count(*)`.as('count') }).from(this.table);
                    // @ts-ignore - vingSchema knows best
                    let where = eq(this.table[field.name], params[field.name as keyof ModelInsert<T>]);
                    if (this.isInserted)
                        // @ts-ignore - vingSchema knows best
                        where = and(where, ne(this.table.id, this.get('id')));

                    let count = (await query.where(where))[0].count
                    if (count > 0) {
                        console.log('--- unique check failed ---', fieldName)
                        throw ouch(409, `${field.name.toString()} must be unique, but ${params[field.name as keyof ModelInsert<T>]} has already been used.`, field.name)
                    }
                }
                if (param !== null)
                    this.set(field.name as keyof ModelSelect<T>, param);
                if (field.relation && field.relation.type == 'parent') {
                    const parent = await this.parent(field.relation.name);
                    parent.canEdit(currentUser);
                }

            }
        }
        return true;
    }

    public parent(name: string) {
        try {
            //@ts-expect-error
            return this[name]
        }
        catch {
            const schema = findVingSchema(this.table[Name])
            throw ouch(404, `Couldn't find parent "${name}" on ${schema.kind}.`);
        }
    }

    public async updateAndVerify(params: ModelSelect<T>, currentUser?: AuthorizedUser) {
        await this.setPostedProps(params, currentUser);
        await this.update();
    }
}

export class VingKind<T extends ModelName, VR extends VingRecord<T>> {

    constructor(public db: MySql2Database, public table: ModelMap[T]['model'], public recordClass: Constructable<VR>) { }

    protected propDefaults: { prop: keyof ModelMap[T]['insert'], field: AnyMySqlColumn, value: any }[] = []

    public async describeList(
        params: DescribeListParams = {},
        where?: SQL,
        orderBy: (SQL | AnyMySqlColumn)[] = [asc(this.table.createdAt)]
    ) {
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
        const out: DescribeList<T> = {
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

    public copy(originalProps: Partial<ModelSelect<T>>) {
        let props = { ...originalProps };
        delete props.id;
        delete props.createdAt;
        return this.mint(props);
    }

    public mint(props?: Partial<ModelInsert<T>>) {
        const output: Record<string, any> = {};
        for (const item of this.propDefaults) {
            output[item.prop as keyof typeof output] = item.value;
        }
        for (const prop of findVingSchema(this.table[Name]).props) {
            // @ts-ignore
            if (props && props[prop.name] !== undefined)
                // @ts-ignore
                output[prop.name] = props[prop.name]
            else if (prop.type == 'string' || prop.type == 'enum' || prop.type == 'id')
                output[prop.name] = stringDefault(prop)
            else if (prop.type == 'boolean')
                output[prop.name] = booleanDefault(prop)
            else if (prop.type == 'number')
                output[prop.name] = numberDefault(prop)
            else if (prop.type == 'date')
                output[prop.name] = dateDefault(prop)
        }
        return new this.recordClass(this.db, this.table, output as ModelSelect<T>, false);
    }

    public async create(props: ModelInsert<T>) {
        const obj = this.mint(props);
        await obj.insert();
        return obj;
    }

    public async createAndVerify(props: ModelSelect<T>, currentUser?: AuthorizedUser) {
        const obj = this.mint({});
        obj.testCreationProps(props);
        await obj.setPostedProps(props, currentUser);
        await obj.insert();
        return obj;
    }

    public get select() { return this.db.select().from(this.table) }
    public get delete() { return this.db.delete(this.table) }
    public get update() { return this.db.update(this.table) }
    public get insert() { return this.db.insert(this.table) }

    public async count(where?: SQL) {
        return (await this.db.select({ count: sql<number>`count(*)`.as('count') }).from(this.table).where(this.calcWhere(where)))[0].count;
    }

    public async find(id: ModelSelect<T>['id']) {
        try {
            return await this.findOrDie(id);
        } catch {
            return undefined;
        }
    }

    public async findOrDie(id: ModelSelect<T>['id']) {
        const props = (await this.select.where(eq(this.table.id, id)))[0] as ModelSelect<T>;
        if (props)
            return new this.recordClass(this.db, this.table, props);
        const schema = findVingSchema(this.table[Name]);
        throw ouch(404, `${schema.kind} not found.`)
    }

    public async findOne(where?: SQL) {
        const result = await this.findMany(where, { limit: 1 });
        if (result.length)
            return result[0];
        return undefined;
    }

    private calcWhere(where?: SQL) {
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

    public async findMany(
        where?: SQL,
        options?: {
            limit?: number,
            offset?: number,
            orderBy?: (SQL | AnyMySqlColumn)[]
        }
    ) {
        //  const customArgs = this.getDefaultArgs(args) as TModel[T]['findMany']['args'];
        let query = this.select.where(this.calcWhere(where));
        if (options && options.limit)
            query.limit(options.limit);
        if (options && options.offset)
            query.offset(options.offset);
        const results = (await query) as ModelSelect<T>[];
        return results.map(props => new this.recordClass(this.db, this.table, props));
    }

}