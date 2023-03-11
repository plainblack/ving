import { Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, BeforeUpdate, AfterLoad, AfterInsert } from "typeorm";
import { v4 } from 'uuid';
import { vingOption, vingProp, vingSchema, AuthorizedUser, ModelName, ModelProps, Describe, Roles, DescribeParams } from '../types';
import { ouch } from '../../app/helpers';

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

    public vingSchema() {
        const schema: vingSchema<T> = {
            kind: 'VingRecord',
            owner: ['admin'],
            props: _p
        }
        return schema;
    }

    private warnings: Describe<T>['warnings'] = [];

    public addWarning(warning: { code: number, message: string }) {
        this.warnings?.push(warning);
    }

    public get<K extends keyof ModelProps<T>>(key: K): ModelProps<T>[K] {
        //@ts-ignore - its what we think it is, but i don't know how to hook it up to the class
        return this[key];
    }

    public set<K extends keyof ModelProps<T>>(key: K, value: ModelProps<T>[K]) {
        const schema = this.vingSchema();
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

    public getAll() {
        const out: ModelProps<T> = {};
        const schema = this.vingSchema();
        for (const prop of schema.props) {
            out[prop.name as keyof ModelProps<T>] = this.get(prop.name as keyof ModelProps<T>);
        }
        return out;
    }

    public setAll(props: ModelProps<T>) {
        for (const key in props) {
            this.set(key, props[key])
        }
    }

    public isOwner(currentUser: AuthorizedUser) {
        if (currentUser === undefined)
            return false;
        const schema = this.vingSchema();
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
        const schema = this.vingSchema();
        if (this.isOwner(currentUser)) {
            return true;
        }
        throw ouch(403, `You do not have the privileges to edit ${schema.kind}.`)
    }

    public async describe(params: DescribeParams = {}) {
        const schema = this.vingSchema();
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
        const schema = this.vingSchema()
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

    public verifyCreationParams(params: ModelProps<T>) {
        const schema = this.vingSchema();
        for (const field of schema.props) {
            if (!field.required || field.default !== undefined)//|| field.relationName)
                continue;
            if (params[field.name] !== undefined && params[field.name] != '')
                continue;
            const fieldName = field.name.toString();
            throw ouch(441, `${fieldName} is required.`, fieldName);
        }
        return true;
    }

    public async verifyPostedParams(params: ModelProps<T>, currentUser?: AuthorizedUser) {
        const schema = this.vingSchema();
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
                    // let where: Model[T]['count']['args']['where'] = {};
                    if (this.isInserted) {
                        // where = { id: { 'not': this.id } };
                    }
                    //console.log('checking');
                    // @ts-ignore - no idea what the magic incantation should be here
                    //where[field.name] = params[field.name];
                    //  where.id = 'xx';
                    // console.log(where);
                    //const count = await this.prisma.count({ where });
                    // console.log(`SELECT count(*) FROM ${schema.name} WHERE ${field.name.toString()} = '${params[field.name]}'`);
                    //const count = await prisma.$queryRawUnsafe(`SELECT count(*) FROM ${schema.name} WHERE ${field.name.toString()} = '${params[field.name]}'`) as number;

                    const count = 0;
                    // console.log('count:', count)
                    if (count > 0) {
                        //    console.log('--- unique check failed ---')
                        throw ouch(409, `${field.name.toString()} must be unique, but ${params[field.name]} has already been used.`, field.name)
                    }
                }

                this.set(field.name, params[field.name]);
            }
        }
        return true;
    }

    public async updateAndVerify(params: ModelProps<T>, currentUser?: AuthorizedUser) {
        await this.verifyPostedParams(params, currentUser);
        await this.save();
    }

}