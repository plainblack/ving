import { Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, BeforeUpdate, AfterLoad, AfterInsert } from "typeorm";
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder'
import { v4 } from 'uuid';
import { vingOption, vingProp, vingSchema, AuthorizedUser, ModelName, ModelProps, Describe, Roles, DescribeParams, DescribeList, DescribeListParams } from '../types';
import { ouch } from '../../app/helpers';
import _ from 'lodash';

export type VingRecordProps = {
    id: string,
    createdAt: Date,
    updatedAt: Date,
};

const _p: vingProp<any>[] = [
    {
        name: 'id',
        required: true,
        default: () => v4(),
        db: { type: 'char', length: 36 },
        view: ['public'],
        edit: [],
    },
    {
        name: 'createdAt',
        required: true,
        db: { type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" },
        default: () => new Date(),
        view: ['public'],
        edit: [],
    },
    {
        name: 'updatedAt',
        required: true,
        db: { type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" },
        default: () => new Date(),
        view: ['public'],
        edit: [],
    },
];

export const findPropInSchema = (name: string | number | symbol, props: vingProp<any>[]) => {
    return props.find(prop => prop.name == name);
}

export const stringDefault = (name: string, props: vingProp<any>[]) => {
    const field = props.find(prop => prop.name == name);
    if (field) {
        if (typeof field.default == 'string')
            return field.default;
        if (typeof field.default == 'function') {
            const value = field.default();
            if (typeof value == 'string')
                return value;
        }
    }
    return '';
}

export const numberDefault = (name: string, props: vingProp<any>[]) => {
    const field = props.find(prop => prop.name == name);
    if (field) {
        if (typeof field.default == 'number')
            return field.default;
        if (typeof field.default == 'function') {
            const value = field.default();
            if (typeof value == 'number')
                return value;
        }
    }
    return 0;
}

export const booleanDefault = (name: string, props: vingProp<any>[]) => {
    const field = props.find(prop => prop.name == name);
    if (field) {
        if (typeof field.default == 'boolean')
            return field.default;
        if (typeof field.default == 'function') {
            const value = field.default();
            if (typeof value == 'boolean')
                return value;
        }
    }
    return false;
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

export const dbProps = (name: string, props: vingProp<any>[]) => {
    const out: { nullable?: boolean, default?: string | number, enum?: string[] | boolean[] } = {};
    const field = findPropInSchema(name, props);
    if (field) {
        if (!field.required && field.default === undefined)
            out.nullable = true;
        if (typeof field.default == 'string' || typeof field.default == 'number')
            out.default = field.default;
        if (Array.isArray(field.enums) && field.enums.length) {
            const stringEnums: string[] = [];
            if (typeof field.enums[0] == 'string') {
                out.enum = field.enums;
            }
        }
    }
    return { ...out, ...field?.db };
}

@Entity()
export class VingRecord<T extends ModelName> extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id = stringDefault('id', _p);

    @CreateDateColumn(dbProps('createdAt', _p))
    createdAt = new Date();

    @UpdateDateColumn(dbProps('updatedAt', _p))
    updatedAt = new Date();

    private _inserted = false;
    get isInserted() {
        return this._inserted;
    }

    @BeforeUpdate()
    private updateDates() {
        this.updatedAt = new Date()
    }

    @AfterLoad()
    @AfterInsert()
    setInserted() {
        this._inserted = true;
    }

    protected buildVingSchema() {
        const schema: vingSchema<T> = {
            kind: 'VingRecord',
            owner: ['admin'],
            props: _p
        }
        return _.cloneDeep(schema);
    }

    private cachedVingSchema!: vingSchema<T>;

    public get vingSchema() {
        if (this.cachedVingSchema === undefined) {
            this.cachedVingSchema = this.buildVingSchema();
        }
        return this.cachedVingSchema;
    }

    private warnings: Describe<T>['warnings'] = [];

    public addWarning(warning: { code: number, message: string }) {
        this.warnings?.push(warning);
    }

    public get<K extends keyof ModelProps<T>>(key: K): ModelProps<T>[K] {
        //@ts-ignore - its what we think it is, but i don't know how to hook it up to the class
        return this[key];
    }

    public getAll() {
        const out: ModelProps<T> = {};
        const schema = this.vingSchema;
        for (const prop of schema.props) {
            out[prop.name as keyof ModelProps<T>] = this.get(prop.name as keyof ModelProps<T>);
        }
        return out;
    }

    public set<K extends keyof ModelProps<T>>(key: K, value: ModelProps<T>[K]) {
        const schema = this.vingSchema;
        const prop = findPropInSchema(key, schema.props);
        if (prop) {
            if (prop.zod) {
                const result = prop.zod.safeParse(value);
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
        //@ts-ignore - its what we think it is, but i don't know how to hook it up to the class
        return this[key] = value;
    }

    public setAll(props: ModelProps<T>) {
        const schema = this.vingSchema;
        for (const key in props) {
            const field = findPropInSchema(key, schema.props)
            if (!field?.noSetAll)
                this.set(key, props[key]);
        }
        return this;
    }

    public isOwner(currentUser: AuthorizedUser) {
        if (currentUser === undefined)
            return false;
        const schema = this.vingSchema;
        const props = this.getAll();
        for (let owner of schema.owner) {
            let found = owner.match(/^\$(.*)$/);
            if (found) {
                if (props[found[1] as keyof ModelProps<T>] == currentUser.get('id')) {
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
        const schema = this.vingSchema;
        if (this.isOwner(currentUser)) {
            return true;
        }
        throw ouch(403, `You do not have the privileges to edit ${schema.kind}.`)
    }

    public async describe(params: DescribeParams = {}) {
        const schema = this.vingSchema;
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);

        let out: Describe<T> = { props: {} };
        if (include !== undefined && include.links) {
            out.links = { base: `/api/${schema.kind?.toLowerCase()}` };
            out.links.self = `${out.links.base}/${this.get('id')}`;
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
            // if (field.kind !== 'object') { // enable this check once working with related objects
            out.props[field.name] = this.get(field.name);
            //  }

            /*  // links 
              if (typeof out.links === 'object'
                  && include.links
                  && field.relationName
              ) {
                  let lower = fieldName.toLowerCase();
                  out.links[lower] = `${out.links.self}/${lower}`;
              }*/

            // related
            /*  if (typeof out.related === 'object'
                  && include.related !== undefined && include.related.length > 0
                  && field.relationName
                  && include.related.includes(fieldName)
              ) {
                  if (field.relationFromFields.length > 0) { // parent relationship
                      let parent = await this[field.name as keyof this] as VingRecord<T>;
                      out.related[fieldName] = await parent.describe({ currentUser: currentUser })
                  }
              } */
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

    public propOptions(params: DescribeParams = {}) {
        const options: Describe<T>['options'] = {};
        const currentUser = params.currentUser;
        const include = params.include || {};
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);
        const schema = this.vingSchema
        for (const field of schema.props) {
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
    }

    public testRequiredProps(params: ModelProps<T>) {
        const schema = this.vingSchema;
        for (const field of schema.props) {
            if (!field.required || (field.default !== undefined && field.default !== ''))//|| field.relationName)
                continue;
            if (params[field.name] !== undefined && params[field.name] != '')
                continue;
            const fieldName = field.name.toString();
            throw ouch(441, `${fieldName} is required.`, fieldName);
        }
        return true;
    }

    public async setPostedProps(params: ModelProps<T>, currentUser?: AuthorizedUser) {
        const schema = this.vingSchema;
        const isOwner = currentUser !== undefined && this.isOwner(currentUser);

        for (const field of schema.props) {
            const fieldName = field.name.toString();

            const roles = [...field.edit];
            const editable = (roles.includes('owner') && (isOwner || !this.isInserted))
                || (currentUser !== undefined && currentUser.isaRole(roles));
            if (!editable) {
                continue;
            }
            if (params[field.name] === undefined) {//|| field.relationName) {
                continue;
            }
            if (params[field.name] === '' && field.required) {
                throw ouch(441, `${fieldName} is required.`, fieldName);
            }
            if (field.name !== undefined && params[field.name] !== undefined) {

                if (field.unique) {
                    // @ts-ignore - typescript doesn't know about the static methods on the class when called via constructor
                    let qb = this.constructor.qb("me")
                        .where('me.' + field.name.toString() + ' = :field', { field: field.name })
                    if (this.isInserted) {
                        qb = qb.andWhere('me.id <> :id', { id: this.get('id') })
                    }
                    const count = await qb.getCount();
                    if (count > 0) {
                        throw ouch(409, `${field.name.toString()} must be unique, but ${params[field.name]} has already been used.`, field.name)
                    }
                }

                this.set(field.name, params[field.name]);
            }
        }
        return true;
    }

    public async updateAndVerify(params: ModelProps<T>, currentUser?: AuthorizedUser) {
        await this.setPostedProps(params, currentUser);
        await this.save();
    }

    public copy() {
        let props = { ...this.getAll() };
        delete props.id;
        delete props.createdAt;
        // @ts-ignore - typescript doesn't like newing the constructor this way
        const copy = new this.constructor;
        copy.setAll(props);
        return copy;
    }

    static async createAndVerify<T extends ModelName>(props: ModelProps<T>, currentUser?: AuthorizedUser) {
        const obj = new this()
        obj.testRequiredProps(props);
        await obj.setPostedProps(props, currentUser);
        await obj.save();
        return obj;
    }

    static async describeList<T extends ModelName>(qb: SelectQueryBuilder<any>, params: DescribeListParams = {}) {
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
        const totalItems = await qb.getCount();
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
            const records = await qb.take(itemsPerPage).skip(itemsPerPage * (pageNumber - 1)).getMany();
            for (let record of records) {
                out.items.push(await record.describe(params.objectParams));
                maxItemsThisPage--;
                if (maxItemsThisPage < 1) break;
            }
        }
        return out;
    }

    static async findIdOrDie(id: string) {
        const record = await this.findOneBy({ id });
        if (record !== null) {
            return record;
        }
        const schema = new this().vingSchema;
        throw ouch(404, schema.kind + ' not found.');
    }

    static qb(alias?: string) {
        return this.createQueryBuilder(alias);
    }

}