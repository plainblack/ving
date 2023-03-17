//import { UserRecord } from "./Users";
import { Roles, ExtendedRoleOptions, ModelName, vingSchema, ModelProps, Describe, warning, AuthorizedUser, DescribeParams, DescribeListParams, vingOption, DescribeList } from '../../types'
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

export const findVingSchema = <T extends ModelName>(nameToFind: string = '-unknown-') => {
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

export interface VingRecord<T extends ModelName> {
    id: ModelProps<T>['id'],
    warnings: Describe<T>['warnings'],
    addWarning(warning: warning): void,
    get<K extends keyof ModelProps<T>>(key: K): ModelProps<T>[K],
    getAll(): ModelProps<T>,
    set<K extends keyof ModelProps<T>>(key: K, value: ModelProps<T>[K]): ModelProps<T>[K],
    setAll(props: ModelProps<T>): ModelProps<T>,
    isInserted: boolean,
    insert(): Promise<ModelProps<T>>,
    update(): Promise<ModelProps<T>>,
    delete(): Promise<ModelProps<T>>,
    refetch(): Promise<ModelProps<T>>,
    isOwner(currentUser: AuthorizedUser): boolean,
    canEdit(currentUser: AuthorizedUser): boolean,
    describe(params: DescribeParams): Promise<Describe<T>>,
    propOptions(params: DescribeParams): Describe<T>['options'],
    verifyCreationParams(params: ModelProps<T>): boolean,
    verifyPostedParams(params: ModelProps<T>, currentUser?: AuthorizedUser): Promise<boolean>,
    updateAndVerify(params: ModelProps<T>, currentUser?: AuthorizedUser): void,
}

export type useVingRecordOptions<T extends ModelName> = { db: MySql2Database, model: any, props: ModelProps<T>, inserted?: boolean }

export function useVingRecord<T extends ModelName>(
    { db, model, props, inserted = true }: useVingRecordOptions<T>
) {

    const VingRecord: VingRecord<T> = {

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
            return props[key] = value;
        },

        setAll(props: ModelProps<T>) {
            for (const key in props) {
                this.set(key, props[key])
            }
            return props;
        },

        get isInserted() {
            return inserted;
        },

        async insert() {
            if (inserted) {
                throw ouch(409, `${prisma.name} already inserted`);
            }
            inserted = true;
            return props = (await prisma.create({ data: props as any })) as ModelProps<T>;
        },

        async update() {
            return props = await prisma.update({ where: { id: props.id }, data: props }) as ModelProps<T>
        },

        async delete() {
            return props = await prisma.delete({ where: { id: props.id } }) as ModelProps<T>
        },

        async refetch() {
            return props = await prisma.findUniqueOrThrow({ where: { id: props.id } }) as ModelProps<T>
        },

        isOwner(currentUser) {
            if (currentUser === undefined)
                return false;
            const table = findVingSchema<T>(prisma.name);
            for (let owner of table.ving.owner) {
                let found = owner.match(/^\$(.*)$/);
                if (found) {
                    if (props[found[1] as keyof ModelProps<T>] == currentUser.getRoleProp('id')) {
                        return true;
                    }
                }
                found = owner.match(/^([A-Za-z]+)$/);
                if (found) {
                    if (found[1] && currentUser.isRole(found[1] as keyof TRoles) == true) {
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
            throw ouch(403, `You do not have the privileges to access ${prisma.name}.`)
        },

        async describe(params = {}) {
            const currentUser = params.currentUser;
            const include = params.include || {};
            const isOwner = currentUser !== undefined && this.isOwner(currentUser);

            let out: Describe<T> = { props: {} };
            if (include !== undefined && include.links) {
                out.links = { base: `/api/${prisma.name?.toLowerCase()}` };
                out.links.self = `${out.links.base}/${props.id}`;
            }
            if (include !== undefined && include.options) {
                out.options = this.propOptions(params);
            }
            if (include !== undefined && include.meta) {
                out.meta = {
                    type: prisma.name,
                };
            }
            if (include !== undefined && include.related && include.related.length) {
                out.related = {};
            }
            if (this.warnings?.length) {
                out.warnings = this.warnings;
            }

            for (const field of findVingSchema<T>(prisma.name).fields) {

                // determine field visibility
                const roles = [...field.ving.viewBy, ...field.ving.editBy];
                const visible = roles.includes('public')
                    || (include !== undefined && include.private)
                    || (roles.includes('owner') && isOwner)
                    || (currentUser !== undefined && currentUser.isaRole(roles));
                if (!visible) continue;

                const fieldName = field.name.toString();

                // props
                if (field.kind !== 'object') {
                    out.props[fieldName as keyof Describe<T>['props']] = props[field.name];
                }

                // links 
                if (typeof out.links === 'object'
                    && include.links
                    && field.relationName
                ) {
                    let lower = fieldName.toLowerCase();
                    out.links[lower] = `${out.links.self}/${lower}`;
                }

                // related
                if (typeof out.related === 'object'
                    && include.related !== undefined && include.related.length > 0
                    && field.relationName
                    && include.related.includes(fieldName)
                ) {
                    if (field.relationFromFields.length > 0) { // parent relationship
                        //need to handle related differently, probably by consumers adding their own related processors
                        //         let parent = await this[field.name as keyof this] as VingRecord<T>;
                        //       out.related[fieldName] = await parent.describe({ currentUser: currentUser })
                    }
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
            for (const field of findVingSchema<T>(prisma.name).props) {
                const roles = [...field.view, ...field.edit];
                const visible = roles.includes('public')
                    || (include !== undefined && include.private)
                    || (roles.includes('owner') && isOwner)
                    || (currentUser !== undefined && currentUser.isaRole(roles));
                if (!visible) continue;
                if (field.enums && field.enums.length > 0) {
                    options[field.name] = enum2options(field.enums, field.enumLabels);
                }
            }
            return options;
        },

        verifyCreationParams(params) {
            const schema = findVingSchema<T>(prisma.name);
            for (const field of schema.props) {
                if (!field.required || field.default || field.relation)
                    continue;
                const fieldName = field.name.toString();
                if (params[field.name] !== undefined && params[field.name] != '')
                    continue;
                throw ouch(441, `${fieldName} is required.`, fieldName);
            }
            return true;
        },

        async verifyPostedParams(params, currentUser) {
            const schema = findVingSchema<T>(prisma.name);
            const isOwner = currentUser !== undefined && this.isOwner(currentUser);

            for (const field of schema.props) {
                const fieldName = field.name.toString();

                const roles = [...field.edit];
                const editable = (roles.includes('owner') && (isOwner || !this.isInserted))
                    || (currentUser !== undefined && currentUser.isaRole(roles));
                if (!editable) {
                    continue;
                }
                if (params[field.name] === undefined || field.relation) {
                    continue;
                }
                if (params[field.name] === '' && field.required) {
                    throw ouch(441, `${fieldName} is required.`, fieldName);
                }
                if (field.name !== undefined && params[field.name] !== undefined) {

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
                    console.log('setting', fieldName)
                    this.set(field.name, params[field.name]);
                }
            }
            return true;
        },

        async updateAndVerify(params, currentUser) {
            await this.verifyPostedParams(params, currentUser);
            await this.update();
        },
    }
    return VingRecord;
}


export interface VingKind<T extends ModelName, VR extends VingRecord<'User'>> {
    db: MySql2Database,
    model: ModelProps<T>,
    describeList(params: DescribeListParams, whereCallback?: (condition?: SQL) => SQL | undefined): Promise<DescribeList<T>>,
    copy(originalProps: ModelProps<T>): VR,
    mint(props?: Partial<ModelProps<T>>): VR,
    create(props: ModelProps<T>): Promise<VR>,
    createAndVerify(props: ModelProps<T>, currentUser?: AuthorizedUser): Promise<VR>,
    getDefaultArgs(args?: object): object,
    select(): any,
    delete(): any,
    update(): any,
    insert(): any,
    count(whereCallback?: (condition?: SQL) => SQL | undefined): Promise<number>,
    find(id: ModelProps<T>['id']): Promise<VR>,
    findMany(whereCallback?: (condition?: SQL) => SQL | undefined): Promise<VR[]>,
    getOptions(): Describe<T>['options'],
}

export function useVingKind<T extends ModelName, VR extends VingRecord<T>>(
    { db, model, recordComposable, propDefaults }: { db: MySql2Database, model: any, recordComposable: (opts: useVingRecordOptions<T>) => VR, propDefaults: ModelProps<T> }
) {

    const VingKind: VingKind<T, VR> = {
        db,
        model,
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
                const records = await this.findMany(whereCallback).limit(itemsPerPage).offset(itemsPerPage * (pageNumber - 1));
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
            for (const prop of findVingSchema(model[Name]).props) {
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
            return recordComposable({ db, model, props: output as ModelProps<T>, inserted: false });
        },

        async create(props) {
            const obj = this.mint(props);
            await obj.insert();
            return obj;
        },

        async createAndVerify(props, currentUser) {
            const obj = this.mint({});
            obj.verifyCreationParams(props);
            await obj.verifyPostedParams(props, currentUser);
            await obj.insert();
            return obj;
        },

        getDefaultArgs(args) {
            const defaultArgs = Object.keys(propDefaults).length ? { where: { ...propDefaults } } : {};
            return _.defaults(defaultArgs, args);
        },

        select: () => db.select().from(model),
        delete: () => db.delete(model),
        update: () => db.update(model),
        insert: () => db.insert(model),

        async count(whereCallback = (c) => c) {
            return (await db.select({ count: sql<number>`count(*)`.as('count') }).from(model).where(whereCallback()))[0].count;
        },

        async find(id) {
            const props = await this.select.where(eq(model.id, id)) as ModelProps<T>;
            return recordComposable({ db, model, props });
        },

        async findMany(whereCallback = (c) => c) {
            //  const customArgs = this.getDefaultArgs(args) as TModel[T]['findMany']['args'];
            const results: ModelProps<T>[] = await this.select.where(whereCallback());
            return results.map(props => recordComposable({ db, model, props }));
        },

        getOptions() {
            const options: Describe<T>['options'] = {};
            for (const field of findVingSchema<T>(model[Name]).props) {
                if (field.type == 'enum' && field.enums && field.enums.length > 0) {
                    options[field.name] = enum2options(field.enums, field.enumLabels);
                }

            }
            return options;
        },
    }
    return VingKind;
}