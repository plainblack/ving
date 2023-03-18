import { Entity, Column, Index, OneToMany } from "typeorm";
import { VingRecord, dbProps, stringDefault, booleanDefault, VingRecordProps } from './VingRecord';
import { vingProp, ArrayToTuple, DescribeParams, AuthorizedUser, ModelProps } from '../types';
import { APIKey } from "./APIKey";
import { z } from "zod";
import { RoleMixin } from "../mixin/Role";
import { ouch } from '../../server/helpers';
import { cache } from '../../server/cache';
import bcrypt from 'bcryptjs';

export const RoleOptions = ["admin", "developer"] as const;

const useAsDisplayNameEnums = ['username', 'email', 'realName'] as const;
type useAsDisplayNameTuple = ArrayToTuple<typeof useAsDisplayNameEnums>;

const passwordTypeEnums = ['bcrypt'] as const;
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
        db: { type: 'varchar', length: 255 },
        view: [],
        edit: [],
    },
    {
        name: 'passwordType',
        required: false,
        db: { type: 'enum' },
        default: 'bcrypt',
        enums: passwordTypeEnums,
        enumLabels: ['Bcrypt'],
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
        view: ['owner'],
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
        edit: ['owner'],
    },
];

@Entity()
export class User extends RoleMixin(VingRecord<'User'>) {

    @Index({ unique: true })
    @Column(dbProps('username', _p))
    username!: string

    @Index({ unique: true })
    @Column(dbProps('email', _p))
    email!: string

    @Column(dbProps('realName', _p))
    realName = stringDefault('realName', _p)

    @Column(dbProps('password', _p))
    password = stringDefault('password', _p)

    @Column(dbProps('passwordType', _p))
    passwordType: passwordTypeTuple = stringDefault('passwordType', _p) as passwordTypeTuple

    @Column(dbProps('useAsDisplayName', _p))
    useAsDisplayName: useAsDisplayNameTuple = stringDefault('useAsDisplayName', _p) as useAsDisplayNameTuple

    @Column(dbProps('admin', _p))
    admin = booleanDefault('admin', _p)

    @Column(dbProps('developer', _p))
    developer = booleanDefault('developer', _p)

    @OneToMany(() => APIKey, (apikey) => apikey.user, {
        cascade: true,
    })
    apikeys!: APIKey[]


    protected buildVingSchema() {
        const schema = super.buildVingSchema();
        schema.kind = 'User';
        schema.owner.push('$id');
        schema.props.push(..._p);
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
        if (this.get('passwordType') == 'bcrypt')
            passed = bcrypt.compareSync(password, this.get('password') || '');
        else
            throw ouch(404, 'validating other password types not implemented');
        if (passed) {
            if (this.get('passwordType') != 'bcrypt') {
                await this.setPassword(password)
                await this.save();
            }
            return true;
        }
        throw ouch(454, 'Password does not match.');
    }

    public async setPassword(password: string) {
        this.set('password', bcrypt.hashSync(password, 10));
        this.set('passwordType', 'bcrypt');
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

    public async setPostedProps(params: ModelProps<'User'>, currentUser?: AuthorizedUser) {
        await super.setPostedProps(params, currentUser);
        if (params !== undefined && params.password && (currentUser === undefined || this.isOwner(currentUser))) {
            await this.setPassword(params.password);
        }
        return true;
    }

    private userChanged = false;
    public async save() {
        if (this.userChanged)
            await cache.set('user-changed-' + this.get('id'), true, 1000 * 60 * 60 * 24 * 7);
        return await super.save();
    }

    public set<K extends keyof ModelProps<'User'>>(key: K, value: ModelProps<'User'>[K]) {
        if (key in ['password', ...RoleOptions]) {
            this.userChanged = true;
        }
        return super.set(key, value);
    }

}