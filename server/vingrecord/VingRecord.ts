import { UserRecord } from "./Users";
import { ModelMap, Roles, ExtendedRoleOptions, ModelName, vingSchema, vingProp, ModelSelect, ModelInsert, Describe, warning, AuthorizedUser, DescribeParams, DescribeListParams, vingOption, DescribeList } from '../../types'
//import { Session } from "../session";
import { vingSchemas } from '../../drizzle/vingSchemas';
import { findObject, ouch } from '../../app/helpers';
import crypto from 'crypto';
import _ from 'lodash';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { SQL } from 'drizzle-orm/sql';
import { MySqlSelectBuilder, MySqlSelect } from 'drizzle-orm/mysql-core/query-builders'
import type { JoinNullability, SelectMode } from 'drizzle-orm/mysql-core/query-builders/select.types';
import { sql } from 'drizzle-orm';
import { like, eq, asc, desc, and, or } from 'drizzle-orm/expressions';
import { Name } from "drizzle-orm/table";
import { stringDefault, booleanDefault, numberDefault, dateDefault } from '../../drizzle/helpers';

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

export interface VingRecord<T extends ModelName> {
    db: MySql2Database,
    table: any,
    id: ModelSelect<T>['id'],
    warnings: Describe<T>['warnings'],
    addWarning(warning: warning): void,
    get<K extends keyof ModelSelect<T>>(key: K): ModelSelect<T>[K],
    getAll(): ModelSelect<T>,
    set<K extends keyof ModelSelect<T>>(key: K, value: ModelSelect<T>[K]): ModelSelect<T>[K],
    setAll(props: Partial<ModelSelect<T>>): ModelSelect<T>,
    isInserted: boolean,
    insert(): Promise<void>,
    update(): Promise<void>,
    delete(): Promise<void>,
    refresh(): Promise<ModelSelect<T>>,
    isOwner(currentUser: AuthorizedUser): boolean,
    canEdit(currentUser: AuthorizedUser): boolean,
    describe(params: DescribeParams): Promise<Describe<T>>,
    propOptions(params: DescribeParams): Describe<T>['options'],
    testCreationProps(params: Partial<ModelSelect<T>>): boolean,
    setPostedProps(params: Partial<ModelSelect<T>>, currentUser?: AuthorizedUser): Promise<boolean>,
    updateAndVerify(params: ModelSelect<T>, currentUser?: AuthorizedUser): void,
}

export type useVingRecordOptions<T extends ModelName> = { db: MySql2Database, table: any, props: ModelSelect<T>, inserted?: boolean }

export function useVingRecord<T extends ModelName>(
    { db, table, props, inserted = true }: useVingRecordOptions<T>
) {

    const VingRecord: VingRecord<T> = {

        db,
        table,
        get id() {
            return props.id;
        },

        warnings: [],

        addWarning(warning) {
            this.warnings?.push(warning);
        },

        get(key) {
            return props[key];
        },

        getAll() {
            return props;
        },

        set(key, value) {
            const schema = findVingSchema(table[Name]);
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
            return props[key] = value;
        },

        setAll(props: ModelSelect<T>) {
            const schema = findVingSchema(table[Name]);
            for (const key in props) {
                const field = findPropInSchema(key, schema.props)
                if (!field?.noSetAll)
                    this.set(key, props[key]);
            }
            return props;
        },

        get isInserted() {
            return inserted;
        },

        async insert() {
            if (inserted) {
                const schema = findVingSchema(table[Name]);
                throw ouch(409, `${schema.kind} already inserted`);
            }
            inserted = true;
            await db.insert(table).values(props);
        },

        async update() {
            await db.update(table).set(props).where(eq(table.id, props.id));
        },

        async delete() {
            await db.delete(table).where(eq(table.id, props.id));
        },

        async refresh() {
            return props = (await db.select().from(table).where(eq(table.id, props.id)))[0] as ModelSelect<T>;
        },

        isOwner(currentUser) {
            if (currentUser === undefined)
                return false;
            const schema = findVingSchema(table[Name]);
            for (let owner of schema.owner) {
                let found = owner.match(/^\$(.*)$/);
                if (found) {
                    if (props[found[1] as keyof ModelSelect<T>] == currentUser.getRoleProp('id')) {
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
        },

        canEdit(currentUser) {
            if (this.isOwner(currentUser)) {
                return true;
            }
            const schema = findVingSchema(table[Name]);
            throw ouch(403, `You do not have the privileges to access ${schema.kind}.`)
        },

        async describe(params = {}) {
            const currentUser = params.currentUser;
            const include = params.include || {};
            const isOwner = currentUser !== undefined && this.isOwner(currentUser);
            const schema = findVingSchema(table[Name]);

            let out: Describe<T> = { props: {} };
            if (include !== undefined && include.links) {
                out.links = { base: `/api/${schema.kind?.toLowerCase()}` };
                out.links.self = `${out.links.base}/${props.id}`;
            }
            if (include !== undefined && include.options) {
                out.options = this.propOptions(params);
            }
            if (include !== undefined && include.meta) {
                out.meta = {
                    kind: schema.kind,
                };
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
                out.props[field.name as keyof Describe<T>['props']] = props[field.name as keyof ModelSelect<T>];

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
        },

        propOptions(params = {}) {
            const options: Describe<T>['options'] = {};
            const currentUser = params.currentUser;
            const include = params.include || {};
            const isOwner = currentUser !== undefined && this.isOwner(currentUser);
            for (const prop of findVingSchema(table[Name]).props) {
                const roles = [...prop.view, ...prop.edit];
                const visible = roles.includes('public')
                    || (include !== undefined && include.private)
                    || (roles.includes('owner') && isOwner)
                    || (currentUser !== undefined && currentUser.isaRole(roles));
                if (!visible) continue;
                if ((prop.type == 'enum' || prop.type == 'boolean') && prop.enums && prop.enums.length > 0) {
                    options[prop.name as keyof ModelSelect<T>] = enum2options(prop.enums, prop.enumLabels);
                }
            }
            return options;
        },

        testCreationProps(params) {
            const schema = findVingSchema(table[Name]);
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
        },

        async setPostedProps(params, currentUser) {
            const schema = findVingSchema(table[Name]);
            const isOwner = currentUser !== undefined && this.isOwner(currentUser);

            for (const field of schema.props) {
                const fieldName = field.name.toString();
                const param = params[field.name as keyof ModelSelect<T>];
                const roles = [...field.edit];
                const editable = (roles.includes('owner') && (isOwner || !this.isInserted))
                    || (currentUser !== undefined && currentUser.isaRole(roles));
                if (!editable) {
                    continue;
                }
                if (param === undefined || field.relation) {
                    continue;
                }
                if (param === '' && field.required) {
                    throw ouch(441, `${fieldName} is required.`, fieldName);
                }
                if (field.name !== undefined && param !== undefined) {

                    /*     if (field.unique) {
                             let where: TModel[T]['count']['args']['where'] = {};
                             if (this.isInserted) {
                                 where = { id: { 'not': this.id } };
                             }
                             console.log('checking', fieldName);
                             // @ts-ignore - no idea what the magic incantation should be here
                             where[field.name] = params[field.name];
                             //  where.id = 'xx';
                             console.log(where);
                             //const count = await prisma.count({ where });
                             // console.log(`SELECT count(*) FROM ${schema.name} WHERE ${field.name.toString()} = '${params[field.name]}'`);
                             //const count = await prisma.$queryRawUnsafe(`SELECT count(*) FROM ${schema.name} WHERE ${field.name.toString()} = '${params[field.name]}'`) as number;
     
                             const count = 0;
                             console.log('count for ', fieldName, count);
                             // console.log('count:', count)
                             if (count > 0) {
                                 console.log('--- unique check failed ---', fieldName)
                                 throw ouch(409, `${field.name.toString()} must be unique, but ${params[field.name]} has already been used.`, field.name)
                             }
                         }*/
                    if (param !== null)
                        this.set(field.name as keyof ModelSelect<T>, param);
                }
            }
            return true;
        },

        async updateAndVerify(params, currentUser) {
            await this.setPostedProps(params, currentUser);
            await this.update();
        },
    }
    return VingRecord;
}


export interface VingKind<T extends ModelName, VR extends VingRecord<T>> {
    db: MySql2Database,
    table: any,
    describeList(params: DescribeListParams, whereCallback?: (condition?: SQL) => SQL | undefined): Promise<DescribeList<T>>,
    copy(originalProps: Partial<ModelSelect<T>>): VR,
    mint(props?: Partial<ModelSelect<T>>): VR,
    create(props: Partial<ModelSelect<T>>): Promise<VR>,
    createAndVerify(props: ModelSelect<T>, currentUser?: AuthorizedUser): Promise<VR>,
    getDefaultArgs(args?: object): object,
    get select(): any,
    get delete(): any,
    get update(): any,
    get insert(): any,
    count(whereCallback?: (condition?: SQL) => SQL | undefined): Promise<number>,
    find(id: ModelSelect<T>['id']): Promise<VR>,
    findMany(whereCallback?: (condition?: SQL) => SQL | undefined, options?: { limit?: number, offset?: number }): Promise<VR[]>,
    getOptions(): Describe<T>['options'],
}

export type useVingKindOptions<T extends ModelName, VR extends VingRecord<T>> = {
    db: MySql2Database, table: any, recordComposable: (opts: useVingRecordOptions<T>) => VR, propDefaults: Partial<ModelSelect<T>>
}

export function useVingKind<T extends ModelName, VR extends VingRecord<T>>({ db, table, recordComposable, propDefaults }: useVingKindOptions<T, VR>) {

    const VingKind: VingKind<T, VR> = {
        db,
        table,
        async describeList(params = {}, whereCallback = (c) => c) {
            const itemsPerPage = params.itemsPerPage === undefined || params.itemsPerPage > 100 || params.itemsPerPage < 1 ? 10 : params.itemsPerPage;
            const pageNumber = params.pageNumber || 1;
            const maxItems = params.maxItems || 100000000000;
            const itemsUpToThisPage = itemsPerPage * pageNumber;
            const fullPages = Math.floor(maxItems / itemsPerPage);
            let maxItemsThisPage = itemsPerPage;
            let skipResultSet = false;
            if (itemsUpToThisPage - itemsPerPage >= maxItems) {
                skipResultSet = true;
            }
            else if (pageNumber - fullPages == 1) {
                maxItemsThisPage = itemsPerPage - (itemsUpToThisPage - maxItems);
            }
            else if (pageNumber - fullPages > 1) {
                skipResultSet = true;
            }
            const totalItems = await this.count(whereCallback);
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const out: DescribeList<T> = {
                paging: {
                    pageNumber: pageNumber,
                    nextPageNumber: pageNumber + 1 >= totalPages ? pageNumber : pageNumber + 1,
                    previousPageNumber: pageNumber < 2 ? 1 : pageNumber - 1,
                    itemsPerPage: itemsPerPage,
                    totalItems: totalItems,
                    totalPages: totalPages
                },
                items: []
            };
            if (!skipResultSet) {
                const records = await this.findMany(whereCallback, { limit: itemsPerPage, offset: itemsPerPage * (pageNumber - 1) });
                for (let record of records) {
                    out.items.push(await record.describe(params.objectParams || {}));
                    maxItemsThisPage--;
                    if (maxItemsThisPage < 1) break;
                }
            }
            return out;
        },

        copy(originalProps) {
            let props = { ...originalProps };
            delete props.id;
            delete props.createdAt;
            return this.mint(props);
        },

        mint(props?) {
            const output: Record<string, any> = {};
            for (const prop of findVingSchema(table[Name]).props) {
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
            return recordComposable({ db, table, props: output as ModelSelect<T>, inserted: false });
        },

        async create(props) {
            const obj = this.mint(props);
            await obj.insert();
            return obj;
        },

        async createAndVerify(props, currentUser) {
            const obj = this.mint({});
            obj.testCreationProps(props);
            await obj.setPostedProps(props, currentUser);
            await obj.insert();
            return obj;
        },

        getDefaultArgs(args) {
            const defaultArgs = Object.keys(propDefaults).length ? { where: { ...propDefaults } } : {};
            return _.defaults(defaultArgs, args);
        },

        get select() { return db.select().from(table) },
        get delete() { return db.delete(table) },
        get update() { return db.update(table) },
        get insert() { return db.insert(table) },

        async count(whereCallback = (c) => c) {
            return (await db.select({ count: sql<number>`count(*)`.as('count') }).from(table).where(whereCallback()))[0].count;
        },

        async find(id) {
            const props = (await this.select.where(eq(table.id, id)))[0] as ModelSelect<T>;
            return recordComposable({ db, table, props });
        },

        async findMany(whereCallback = (c) => c, options) {
            //  const customArgs = this.getDefaultArgs(args) as TModel[T]['findMany']['args'];
            let query = this.select.where(whereCallback());
            if (options && options.limit)
                query.limit(options.limit);
            if (options && options.offset)
                query.offset(options.offset);
            const results = (await query) as ModelSelect<T>[];
            return results.map(props => recordComposable({ db, table, props }));
        },

        getOptions() {
            const options: Describe<T>['options'] = {};
            for (const field of findVingSchema(table[Name]).props) {
                if (field.type == 'enum' && field.enums && field.enums.length > 0) {
                    options[field.name as keyof ModelSelect<T>] = enum2options(field.enums, field.enumLabels);
                }

            }
            return options;
        },
    }
    return VingKind;
}