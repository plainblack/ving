import { Entity, PrimaryGeneratedColumn, BeforeUpdate, UpdateDateColumn, BaseEntity, CreateDateColumn } from "typeorm";
import { v4 } from 'uuid';

export type vingOption = {
    value: string | boolean,
    label: string
}

export type vingProp = {
    name: string,
    required: boolean,
    unique?: boolean,
    default?: boolean | string | number | Date | undefined | (() => boolean | string | number | Date),
    options: vingOption[],
    view: string[],
    edit: string[],
}

export type vingSchema = {
    kind: string,
    owner: string[]
    props: vingProp[]
}

const _p: vingProp[] = [
    {
        name: 'id',
        required: true,
        default: () => v4(),
        view: ['public'],
        edit: [],
        options: []
    },
    {
        name: 'createdAt',
        required: true,
        default: () => new Date(),
        view: ['public'],
        edit: [],
        options: []
    },
    {
        name: 'updatedAt',
        required: true,
        default: () => new Date(),
        view: ['public'],
        edit: [],
        options: []
    },
];



@Entity()
export abstract class VingRecord extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id = stringDefault('id', _p);

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt = new Date();

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt = new Date();

    @BeforeUpdate()
    updateDates() {
        this.updatedAt = new Date()
    }

    static vingSchema() {
        const schema: vingSchema = {
            kind: 'VingRecord',
            owner: ['admin'],
            props: _p
        }
        return schema;
    }
}




export const findPropInSchema = (name: string, props: vingProp[]) => {
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

export const dbProps = (name: string, props: vingProp[]) => {
    const out: { nullable?: boolean, default?: string | number, enum?: string[] | boolean[] } = {};
    const field = findPropInSchema(name, props);
    if (field) {
        if (!field.required && field.default === undefined)
            out.nullable = true;
        if (typeof field.default == 'string' || typeof field.default == 'number')
            out.default = field.default;
        if (field.options.length) {
            const booleanEnums: boolean[] = [];
            const stringEnums: string[] = [];
            for (const option of field.options) {
                if (typeof option.value === 'boolean') {
                    booleanEnums.push(option.value);
                }
                else if (typeof option.value === 'string') {
                    stringEnums.push(option.value);
                }
            }
            if (stringEnums.length) {
                out.enum = stringEnums;
            }
            else if (booleanEnums.length) {
                out.enum = booleanEnums;
            }
        }
    }
    return out;
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