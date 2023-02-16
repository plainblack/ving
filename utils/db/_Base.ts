import { Prisma } from "@prisma/client";
import { User, Roles, RoleOptions } from "./Users";
import vingSchemas from './ving-schema.json';
import { findObject, Ouch } from '../utils';
import crypto from 'crypto';
import _ from 'lodash';

export interface IConstructable<T> {
    new(...args: any): T;
}

export type TVingModelProp = {
    owner: string[]
}

export type TVingOption = {
    value: string | boolean
    text: string
}

export type TVingFieldProp = {
    editBy: RoleOptions[]
    viewBy: RoleOptions[];
    options: TVingOption[]
}
export type TVingField<T extends TModelName> = {
    ving: TVingFieldProp
    name: keyof TModel[T]['findUniqueOrThrow']['result'],
    [key: string]: any
}

export type TVingSchema<T extends TModelName> = {
    name: string,
    ving: TVingModelProp
    fields: TVingField<T>[]
    [key: string]: any
}

export type TModel = Prisma.TypeMap['model'];
export type TModelName = keyof TModel;
export type TProps<T extends TModelName> = Partial<TModel[T]['create']['payload']['scalars']>;

export type DescribeParams = {
    currentUser?: User;
    include?: {
        options?: boolean,
        related?: string[],
        extra?: string[],
        links?: boolean,
        private?: boolean,
    }
}

export type DescribeListParams = {
    itemsPerPage?: number;
    pageNumber?: number;
    orderBy?: number;
    sortBy?: number;
    maxItems?: number;
    objectParams?: DescribeParams;
}


export type DescribeList<T extends TModelName> = {
    paging: {
        pageNumber: number
        nextPageNumber: number
        previousPageNumber: number
        itemsPerPage: number
        totalItems: number
        totalPages: number
    },
    items: Describe<T>[]
}

export type Describe<T extends TModelName> = {
    props: TProps<T> & {
        [key: string]: any
    }
    links?: Record<string, string>
    options?: {
        [property in keyof TProps<T>]?: TVingOption[]
    }
    related?: {
        [key: string]: Describe<T>
    }
    /* relatedList?: { // not sure we're going to keep this.
         [key:string]:  DescribeList<T>
     }*/
}

export interface IPrisma<T extends TModelName> {
    findFirstOrThrow(args?: TModel[T]['findFirstOrThrow']['args']): Promise<TModel[T]['findFirstOrThrow']['result']>
    findMany(args?: TModel[T]['findMany']['args']): Promise<TModel[T]['findMany']['result'][]>
    findUniqueOrThrow(args?: TModel[T]['findUniqueOrThrow']['args']): Promise<TModel[T]['findUniqueOrThrow']['result']>
    createMany(args?: TModel[T]['createMany']['args']): Promise<Prisma.BatchPayload>
    create(args?: TModel[T]['create']['args']): Promise<TModel[T]['create']['result']>
    delete(args?: TModel[T]['delete']['args']): Promise<TModel[T]['delete']['result']>
    update(args?: TModel[T]['update']['args']): Promise<TModel[T]['update']['result']>
    deleteMany(args?: TModel[T]['deleteMany']['args']): Promise<Prisma.BatchPayload>
    updateMany(args?: TModel[T]['updateMany']['args']): Promise<Prisma.BatchPayload>
    upsert(args?: TModel[T]['upsert']['args']): Promise<TModel[T]['upsert']['result']>
    //aggregate(args?: TModel[T]['aggregate']['args']): Promise<TModel[T]['aggregate']['result']>
    groupBy(args?: TModel[T]['groupBy']['args']): Promise<TModel[T]['groupBy']['result'][]>
    count(args?: TModel[T]['count']['args']): Promise<number>
    name?: string
}

export class VingRecord<T extends TModelName> {

    constructor(protected kind: VingKind<T, VingRecord<T>>, public props: TProps<T>, private inserted = true) { }

    public get id() {
        return this.props.id;
    }

    public copy(): this {
        let props = { ...this.props } as TProps<T>;
        delete props.id;
        delete props.createdAt;
        return this.kind.mint(props) as this;
    }

    public get isInserted() {
        return this.inserted;
    }

    public async insert() {
        if (this.inserted) {
            throw new Ouch(443, `${this.kind.name} already inserted`);
        }
        this.inserted = true;
        return this.props = await this.kind.prisma.create({ data: this.props as any }) as TProps<T>
    }

    public async update() {
        return this.props = await this.kind.prisma.update({ where: { id: this.props.id }, data: this.props }) as TProps<T>
    }

    public async delete() {
        return this.props = await this.kind.prisma.delete({ where: { id: this.props.id } }) as TProps<T>
    }

    public async refetch() {
        return this.props = await this.kind.prisma.findUniqueOrThrow({ where: { id: this.props.id } }) as TProps<T>
    }

    public isOwner(currentUser: User) {
        const table = this.kind.vingSchema;
        for (let owner of table.ving.owner) {
            let found = owner.match(/^\$(.*)$/);
            if (found) {
                if (this.props[found[1] as keyof TProps<T>] == currentUser.props.id) {
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

    public async describe(params: DescribeParams = {}) {
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);

        let out: Describe<T> = { props: {} };
        if (include !== undefined && include.links) {
            out.links = { base: `/api/${this.kind.name.toLowerCase()}` };
            out.links.self = `${out.links.base}/${this.props.id}`;
        }
        if (include !== undefined && include.options) {
            out.options = {};
        }
        if (include !== undefined && include.related) {
            out.related = {};
        }

        for (const field of this.kind.vingSchema.fields) {

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
                out.props[fieldName as keyof Describe<T>['props']] = this.props[field.name];
            }

            // links 
            if (typeof out.links === 'object'
                && include.links
                && field.relationName
            ) {
                let lower = fieldName.toLowerCase();
                out.links[lower] = `${out.links.self}/${lower}`;
            }

            // options
            if (typeof out.options === 'object'
                && include.options
                && field.ving.options.length > 0
            ) {
                out.options[field.name] = field.ving.options;
            }

            // related
            if (typeof out.related === 'object'
                && include.related !== undefined && include.related.length > 0
                && field.relationName
                && include.related.includes(fieldName)
            ) {
                if (field.relationFromFields.length > 0) { // parent relationship
                    let parent = await this[field.name as keyof this] as VingRecord<T>;
                    out.related[fieldName] = await parent.describe({ currentUser: currentUser })
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
    }

    public verifyCreationParams(params: TProps<T>) {
        const schema = this.kind.vingSchema;
        for (const field of schema.fields) {
            if (!field.isRequired || field.hasDefaultValue || field.relationName)
                continue;
            const fieldName = field.name.toString();
            if (params[field.name] !== undefined && params[field.name] != '')
                continue;
            throw new Ouch(441, `${fieldName} is required.`, fieldName);
        }
        return true;
    }

    public verifyPostedParams(params: TProps<T>, currentUser?: User) {
        const schema = this.kind.vingSchema;
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);

        for (const field of schema.fields) {
            const fieldName = field.name.toString();

            const roles = [...field.ving.editBy];
            const editable = (roles.includes('owner') && (isOwner || !this.isInserted))
                || (currentUser !== undefined && currentUser.isaRole(roles));
            if (!editable)
                continue;
            if (params[field.name] === undefined || field.relationName)
                continue;
            if (params[field.name] == '' && field.isRequired) {
                throw new Ouch(441, `${fieldName} is required.`, fieldName);
            }
            if (field.name !== undefined && params[field.name] !== undefined) {
                this.props[field.name] = params[field.name];
            }
        }
        return true;
    }

}



export class VingKind<T extends TModelName, R extends VingRecord<T>> {

    constructor(public prisma: IPrisma<T>, public recordClass: IConstructable<R>, private propDefaults: TProps<T> = {}) {
        if ('name' in prisma && prisma.name !== undefined) {
            this.name = prisma.name;
            this.vingSchema = this.findVingSchema(this.name);
        }
    }

    public async describeList(params: DescribeListParams = {}, args?: TModel[T]['findMany']['args']) {
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
                out.items.push(await record.describe(params.objectParams));
                maxItemsThisPage--;
                if (maxItemsThisPage < 1) break;
            }
        }
        return out;
    }

    public mint(props: TProps<T>) {
        let data = { ...this.propDefaults, ...props };
        for (const field of this.vingSchema.fields) {
            if (data[field.name as keyof TProps<T>] !== undefined) {
                continue;
            }
            if (field.hasDefaultValue) {
                if (typeof field.default === 'object') {
                    if (field.default.name == 'uuid' && field.name == 'id') {
                        data[field.name as keyof TProps<T>] = crypto.randomUUID() as any;
                    }
                    else if (field.default.name == 'now') {
                        data[field.name as keyof TProps<T>] = new Date() as any;
                    }
                }
                else {
                    data[field.name as keyof TProps<T>] = field.default;
                }
            }
        }
        return new this.recordClass(this, data, false);
    }

    public async create(props: TProps<T>) {
        const obj = this.mint(props);
        await obj.insert();
        return obj;
    }

    private getDefaultArgs(args?: object) {
        const defaultArgs = Object.keys(this.propDefaults).length ? { where: { ...this.propDefaults } } : {};
        return _.defaults(defaultArgs, args);
    }

    public async delete(args?: TModel[T]['delete']['args']) {
        const customArgs = this.getDefaultArgs(args) as TModel[T]['delete']['args'];
        const props = await this.prisma.delete(customArgs);
        return new this.recordClass(this, props);
    }

    public async findFirst(args?: TModel[T]['findFirstOrThrow']['args']) {
        const customArgs = this.getDefaultArgs(args) as TModel[T]['findFirstOrThrow']['args'];
        const props = await this.prisma.findFirstOrThrow(customArgs);
        return new this.recordClass(this, props);
    }

    public async findUnique(args?: TModel[T]['findUniqueOrThrow']['args']) {
        const customArgs = this.getDefaultArgs(args) as TModel[T]['findUniqueOrThrow']['args'];
        const props = await this.prisma.findUniqueOrThrow(customArgs);
        return new this.recordClass(this, props);
    }

    public async findMany(args?: TModel[T]['findMany']['args']) {
        const customArgs = this.getDefaultArgs(args) as TModel[T]['findMany']['args'];
        const results = await this.prisma.findMany(customArgs);
        return results.map(props => new this.recordClass(this, props))
    }

    public async deleteMany(args?: TModel[T]['deleteMany']['args']) {
        const customArgs = this.getDefaultArgs(args) as TModel[T]['deleteMany']['args'];
        return await this.prisma.deleteMany(customArgs);
    }

    public async updateMany(args?: TModel[T]['updateMany']['args']) {
        const customArgs = this.getDefaultArgs(args) as TModel[T]['updateMany']['args'];
        return await this.prisma.updateMany(customArgs);
    }

    public async count(args?: TModel[T]['count']['args']) {
        const customArgs = this.getDefaultArgs(args) as TModel[T]['count']['args'];
        return await this.prisma.count(customArgs);
    }

    public name = '-unknown-';

    public findVingSchema(nameToFind: string) {

        try {
            return findObject('name', nameToFind, vingSchemas) as TVingSchema<T>;
        }
        catch {
            throw new Ouch(440, 'ving schema ' + this.name + ' not found');
        }

    }

    public vingSchema: TVingSchema<T> = { "name": "-unknown-", fields: [], ving: { "owner": [] } };

    public getOptions() {
        const out: Describe<T>['options'] = {};
        for (const field of this.vingSchema.fields) {
            if (field.ving.options.length > 0) {
                out[field.name] = field.ving.options;
            }
        }
        return out;
    }
}
