import { Entity, Column, Index } from "typeorm";
import { VingRecord, dbProps, stringDefault, booleanDefault, VingRecordProps } from './VingRecord';
import { vingProp, ArrayToTuple } from '../types';
import { z } from "zod";
import { RoleMixin } from "../mixin/Role";

export const RoleOptions = ["admin", "developer"] as const;

const useAsDisplayNameEnums = ['username', 'email', 'realName'] as const;
type useAsDisplayNameTuple = ArrayToTuple<typeof useAsDisplayNameEnums>;

const passwordTypeEnums = ['argon2'] as const;
type passwordTypeTuple = ArrayToTuple<typeof passwordTypeEnums>;

export type UserProps = {
    username: string,
    email: string,
    realName: string,
    password: string,
    passwordType: passwordTypeTuple,
    useAsDisplayName: useAsDisplayNameTuple,
    admin: boolean,
    developer: boolean,
} & VingRecordProps;

const _p: vingProp[] = [
    {
        name: 'username',
        required: true,
        db: { type: 'varchar', length: 60 },
        zod: z.string().min(1).max(60),
        unique: true,
        default: '',
        view: [],
        edit: ['owner'],
    },
    {
        name: 'email',
        required: true,
        db: { type: 'varchar', length: 255 },
        zod: z.string().email().max(255),
        unique: true,
        default: '',
        view: [],
        edit: ['owner'],
    },
    {
        name: 'realName',
        required: false,
        default: '',
        db: { type: 'varchar', length: 60 },
        zod: z.string().min(1).max(60),
        view: [],
        edit: ['owner'],
    },
    {
        name: 'password',
        required: false,
        default: '',
        db: { type: 'varchar', length: 60 },
        view: [],
        edit: [],
    },
    {
        name: 'passwordType',
        required: false,
        db: { type: 'enum' },
        default: 'argon2',
        enums: passwordTypeEnums,
        enumLabels: ['Argon 2'],
        view: [],
        edit: [],
    },
    {
        name: 'useAsDisplayName',
        required: true,
        db: { type: 'enum' },
        default: 'username',
        enums: useAsDisplayNameEnums,
        enumLabels: ['Username', 'Email Address', 'Real Name'],
        view: [],
        edit: ['owner'],
    },
    {
        name: 'admin',
        required: true,
        db: { type: 'boolean' },
        default: false,
        enums: [false, true],
        enumLabels: ['Not Admin', 'Admin'],
        view: [],
        edit: ['admin'],
    },
    {
        name: 'developer',
        required: true,
        db: { type: 'boolean' },
        default: false,
        enums: [false, true],
        enumLabels: ['Not a Software Developer', 'Software Developer'],
        view: [],
        edit: ['developer'],
    },
];

@Entity()
export class User extends RoleMixin(VingRecord<'User'>) {

    @Index({ unique: true })
    @Column('text', dbProps('username', _p))
    username!: string

    @Index({ unique: true })
    @Column('text', dbProps('email', _p))
    email!: string

    @Column('text', dbProps('realName', _p))
    realName = stringDefault('realName', _p)

    @Column('text', dbProps('password', _p))
    password = stringDefault('password', _p)

    @Column('text', dbProps('passwordType', _p))
    passwordType: passwordTypeTuple = stringDefault('passwordType', _p) as passwordTypeTuple

    @Column('text', dbProps('useAsDisplayName', _p))
    useAsDisplayName: useAsDisplayNameTuple = stringDefault('useAsDisplayName', _p) as useAsDisplayNameTuple

    @Column('text', dbProps('admin', _p))
    admin = booleanDefault('admin', _p)

    @Column('text', dbProps('developer', _p))
    developer = booleanDefault('developer', _p)

    public vingSchema() {
        const schema = super.vingSchema();
        schema.kind = 'User';
        schema.owner.push('$id');
        schema.props.push(..._p);
        return schema;
    }

}