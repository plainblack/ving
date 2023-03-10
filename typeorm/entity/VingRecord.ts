import { Entity, PrimaryGeneratedColumn, BeforeUpdate, UpdateDateColumn, BaseEntity, CreateDateColumn } from "typeorm";
import { v4 } from 'uuid';
import { vingOption, vingProp, vingSchema, Model, ModelName, ModelProps, Describe } from '../types';

export type VingRecordProps = {
    id: string,
    createdAt: Date,
    updatedAt: Date,
};

const _p: vingProp[] = [
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

export const findPropInSchema = (name: string | number | symbol, props: vingProp[]) => {
    return props.find(prop => prop.name == name);
}

export const stringDefault = (name: string, props: vingProp[]) => {
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

export const numberDefault = (name: string, props: vingProp[]) => {
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

export const booleanDefault = (name: string, props: vingProp[]) => {
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

export const enum2options = (enums: readonly string[], labels: string[]) => {
    const options: vingOption[] = [];
    let i = 0
    for (let value of enums) {
        options.push({
            value: value,
            label: labels[i] !== undefined ? labels[i] : value,
        })
        i++
    }
    return options;
}

export type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};

export const dbProps = (name: string, props: vingProp[]) => {
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
export abstract class VingRecord<T extends ModelName> extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id = stringDefault('id', _p);

    @CreateDateColumn(dbProps('createdAt', _p))
    createdAt = new Date();

    @UpdateDateColumn(dbProps('updatedAt', _p))
    updatedAt = new Date();

    @BeforeUpdate()
    updateDates() {
        this.updatedAt = new Date()
    }

    public vingSchema() {
        const schema: vingSchema = {
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
                    throw key.toString() + ': ' + formatted._errors.join('.') + '.';
                }
            }
        }
        else {
            throw key.toString() + ' is not a prop';
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
}