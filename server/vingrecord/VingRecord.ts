//import { UserRecord } from "./Users";
import { Roles, ExtendedRoleOptions, ModelName, vingSchema, ModelProps, Describe, warning, AuthorizedUser, DescribeParams, DescribeListParams, vingOption, DescribeList } from '../../types'
//import { Session } from "../session";
import { vingSchemas } from '../../drizzle/vingSchemas';
import { findObject, ouch } from '../../app/helpers';
import crypto from 'crypto';
import _ from 'lodash';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type { SQL } from 'drizzle-orm/sql';

export const findVingSchema = <T extends ModelName>(nameToFind: string = '-unknown-') => {
    try {
        return findObject('kind', nameToFind, vingSchemas) as vingSchema;
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

export type useVingRecordOptions<T extends ModelName> = { prisma: IPrisma<T>, props: ModelProps<T>, inserted?: boolean }

export function useVingRecord<T extends ModelName>(
    { prisma, props, inserted = true }: useVingRecordOptions<T>
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
    describeList(params: DescribeListParams, args?: ModelProps<T>): Promise<DescribeList<T>>,
    copy(originalProps: ModelProps<T>): VR,
    mint(props: ModelProps<T>): VR,
    create(props: ModelProps<T>): Promise<VR>,
    createAndVerify(props: ModelProps<T>, currentUser?: AuthorizedUser): Promise<VR>,
    getDefaultArgs(args?: object): object,
    delete(args?: SQL): Promise<VR>,
    findFirst(args?: TModel[T]['findFirstOrThrow']['args']): Promise<VR>,
    findUnique(args?: TModel[T]['findUniqueOrThrow']['args']): Promise<VR>,
    find(id: TModel[T]['findUniqueOrThrow']['payload']['scalars']['id']): Promise<VR>,
    findMany(args?: TModel[T]['findMany']['args']): Promise<VR[]>,
    deleteMany(args?: TModel[T]['deleteMany']['args']): Promise<{ count: number }>,
    updateMany(args?: TModel[T]['updateMany']['args']): Promise<{ count: number }>,
    count(args?: TModel[T]['count']['args']): Promise<number>,
    getOptions(): Describe<T>['options'],
}

export function useVingKind<T extends ModelName, VR extends VingRecord<T>>(
    { db, model, recordComposable, propDefaults }: { db: MySql2Database, model: ModelProps<T>, recordComposable: (opts: useVingRecordOptions<T>) => VR, propDefaults: ModelProps<T> }
) {

    const VingKind: VingKind<T, VR> = {
        db,
        model,
        async describeList(params = {}, args) {
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
            const where = args !== undefined && args.where !== undefined ? args.where : {};
            const totalItems = await this.count({ where: where });
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
                const records = await this.findMany({ where: where, take: itemsPerPage, skip: itemsPerPage * (pageNumber - 1) });
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

        mint(props = {}) {
            let data = { ...propDefaults, ...props };
            for (const field of findVingSchema<T>(prisma.name).props) {
                if (data[field.name as keyof ModelProps<T>] !== undefined) {
                    continue;
                }
                if (field.default) {
                    if (typeof field.default === 'object') {
                        if (field.default.name == 'uuid' && field.name == 'id') {
                            data[field.name as keyof ModelProps<T>] = crypto.randomUUID() as any;
                        }
                        else if (field.default.name == 'now') {
                            data[field.name as keyof ModelProps<T>] = new Date() as any;
                        }
                    }
                    else {
                        data[field.name as keyof ModelProps<T>] = field.default;
                    }
                }
            }
            return recordComposable({ prisma, props: data, inserted: false });
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

        async delete(args) {
            const customArgs = this.getDefaultArgs(args) as TModel[T]['delete']['args'];
            const props = await prisma.delete(customArgs) as ModelProps<T>;
            return recordComposable({ prisma, props });
        },

        async findFirst(args) {
            const customArgs = this.getDefaultArgs(args) as TModel[T]['findFirstOrThrow']['args'];
            const props = await prisma.findFirstOrThrow(customArgs) as ModelProps<T>;
            return recordComposable({ prisma, props });
        },

        async findUnique(args) {
            const customArgs = this.getDefaultArgs(args) as TModel[T]['findUniqueOrThrow']['args'];
            const props = await prisma.findUniqueOrThrow(customArgs) as ModelProps<T>;
            return recordComposable({ prisma, props });
        },

        async find(id) {
            const props = await prisma.findUniqueOrThrow({ where: { id: id } }) as ModelProps<T>;
            return recordComposable({ prisma, props });
        },

        async findMany(args) {
            const customArgs = this.getDefaultArgs(args) as TModel[T]['findMany']['args'];
            const results = (await prisma.findMany(customArgs)) as ModelProps<T>[];
            return results.map(props => recordComposable({ prisma, props }));
        },

        async deleteMany(args) {
            const customArgs = this.getDefaultArgs(args) as TModel[T]['deleteMany']['args'];
            return await prisma.deleteMany(customArgs);
        },

        async updateMany(args) {
            const customArgs = this.getDefaultArgs(args) as TModel[T]['updateMany']['args'];
            return await prisma.updateMany(customArgs);
        },

        async count(args?: TModel[T]['count']['args']) {
            const customArgs = this.getDefaultArgs(args) as TModel[T]['count']['args'];
            return await prisma.count(customArgs);
        },

        getOptions() {
            const out: Describe<T>['options'] = {};
            for (const field of findVingSchema<T>(prisma.name).fields) {
                if (field.ving.options.length > 0) {
                    out[field.name] = field.ving.options;
                }
            }
            return out;
        },
    }
    return VingKind;
}