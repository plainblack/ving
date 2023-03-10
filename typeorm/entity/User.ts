import { Entity, Column, Index } from "typeorm";
import { VingRecord, vingProp, dbProps, stringDefault, booleanDefault, enum2options, ArrayToTuple } from './VingRecord';

const useAsDisplayNameEnums = ['username', 'email', 'realName'] as const;
type useAsDisplayNameTuple = ArrayToTuple<typeof useAsDisplayNameEnums>;

const passwordTypeEnums = ['argon2'] as const;
type passwordTypeTuple = ArrayToTuple<typeof passwordTypeEnums>;

const _p: vingProp[] = [
    {
        name: 'username',
        required: true,
        db: { type: 'varchar', length: 60 },
        unique: true,
        options: [],
        view: [],
        edit: ['owner'],
    },
    {
        name: 'email',
        required: true,
        db: { type: 'varchar', length: 255 },
        unique: true,
        options: [],
        view: [],
        edit: ['owner'],
    },
    {
        name: 'realName',
        required: false,
        db: { type: 'varchar', length: 60 },
        options: [],
        view: [],
        edit: ['owner'],
    },
    {
        name: 'password',
        required: false,
        db: { type: 'varchar', length: 60 },
        options: [],
        view: [],
        edit: [],
    },
    {
        name: 'passwordType',
        required: false,
        db: { type: 'enum' },
        default: 'argon2',
        options: enum2options(passwordTypeEnums, ['Argon 2']),
        view: [],
        edit: [],
    },
    {
        name: 'useAsDisplayName',
        required: true,
        db: { type: 'enum' },
        default: 'username',
        options: enum2options(useAsDisplayNameEnums, ['Username', 'Email Address', 'Real Name']),
        view: [],
        edit: ['owner'],
    },
    {
        name: 'admin',
        required: true,
        db: { type: 'boolean' },
        default: false,
        options: [
            { value: false, label: 'Not Admin' },
            { value: true, label: 'Admin' },
        ],
        view: [],
        edit: ['admin'],
    },
    {
        name: 'developer',
        required: true,
        db: { type: 'boolean' },
        default: false,
        options: [
            { value: false, label: 'Not a Software Developer' },
            { value: true, label: 'Software Developer' },
        ],
        view: [],
        edit: ['developer'],
    },
];



@Entity()
export class User extends VingRecord {

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

    static vingSchema() {
        const schema = super.vingSchema();
        schema.kind = 'User';
        schema.owner.push('$id');
        schema.props.push(..._p);
        return schema;
    }

}