import { Entity, Column, Index } from "typeorm";
import { VingRecord, dbProps, stringDefault, booleanDefault, VingRecordProps } from './VingRecord';
import { vingProp, ArrayToTuple, DescribeParams, AuthorizedUser, ModelProps } from '../types';
import { z } from "zod";
import { RoleMixin } from "../mixin/Role";
import { ouch } from '../../app/helpers';
import { cache } from '../../app/cache';
import { hash, verify } from 'argon2';

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

const _p: vingProp<'User'>[] = [
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

    protected buildVingSchema() {
        const schema = super.buildVingSchema();
        schema.kind = 'User';
        schema.owner.push('$id');
        for (const prop of _p) {
            // console.log(prop.name);
            schema.props.push(prop);
        }
        console.log(schema.props.length);
        //schema.props.push(..._p);
        //  console.log('-----')
        return schema;
    }

    public get displayName() {
        switch (this.get('useAsDisplayName')) {
            case 'realName':
                return this.get('realName');
            case 'email':
                return this.get('email');
            default:
                return this.get('username');
        }
    }

    public get avatarUrl() {
        let url = `https://robohash.org/${this.id}/size_300x300`;

        // foreground
        if (this.id?.match(/^[A-M]/)) {
            url += '/set_set2'
        }
        else if (this.id?.match(/^[a-m]/)) {
            url += '/set_set3'
        }
        else if (this.id?.match(/^[N-Z]/)) {
            url += '/set_set4'
        }

        // background
        if (this.id?.match(/[A-Z]$/)) {
            url += '/bgset_bg1'
        }
        else if (this.id?.match(/[a-z]$/)) {
            url += '/bgset_bg2'
        }

        return url;
    }

    public async testPassword(password: string) {
        if (this.get('password') == undefined)
            throw ouch(400, 'User has no password, you must log in via another provider.');
        if (password == undefined || password == '')
            throw ouch(441, 'You must specify a password.');
        let passed = false;
        if (this.get('passwordType') == 'argon2')
            passed = await verify(password, this.get('password') || '');
        else
            throw ouch(404, 'validating other password types not implemented');
        if (passed) {
            if (this.get('passwordType') != 'argon2') {
                await this.setPassword(password)
                await this.save();
            }
            return true;
        }
        throw ouch(454, 'Password does not match.');
    }

    public async setPassword(password: string) {
        this.set('password', await hash(password));
        this.set('passwordType', 'argon2');
    }

    public async describe(params?: DescribeParams) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            out.meta.displayName = this.displayName;
            out.meta.avatarUrl = this.avatarUrl;
        }
        // just testing
        if (params && params.include && params.include.extra && params.include.extra.includes('foo')) {
            if (out.extra === undefined) {
                out.extra = {};
            }
            out.extra.foo = 'foo';
        }
        return out;
    }

    public async verifyPostedParams(params: ModelProps<'User'>, currentUser?: AuthorizedUser) {
        await super.verifyPostedParams(params, currentUser);
        if (params !== undefined && params.password && (currentUser === undefined || this.isOwner(currentUser))) {
            this.setPassword(params.password);
        }
        return true;
    }

    public async save() {
        cache.set('user-changed-' + this.get('id'), true, 1000 * 60 * 60 * 24 * 7);
        return await super.save();
    }

    public set<K extends keyof ModelProps<'User'>>(key: K, value: ModelProps<'User'>[K]) {
        if (key in ['password', ...RoleOptions]) {
            cache.set('user-changed-' + this.get('id'), true, 1000 * 60 * 60 * 24 * 7);
        }
        // shouldn't need this now that we have zod
        if (key == 'email' && !(value?.toString().match(/.+@.+\..+/))) {
            throw ouch(442, `${value} doesn't look like an email address.`, key);
        }
        return super.set(key, value);
    }

}