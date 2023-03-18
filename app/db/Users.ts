import { prisma } from "./client";
import { VingKind, VingRecord, TProps, DescribeParams, IConstructable } from "./_Base";
import { APIKeyKind, APIKeyRecord } from "./APIKeys";
import { ouch } from '../../server/helpers';
import bcrypt from 'bcrypt';
import { cache } from '../../server/cache';

import { ArrayToTuple } from '../../typeorm/types';


export type TRoleProps = TRoles & Pick<TProps<'User'>, 'id' | 'password'>;

export function RoleMixin<T extends IConstructable<{ getAll(): any, get<K extends keyof TRoleProps>(key: K): TRoleProps[K] }>>(Base: T) {
    class RoleMixin extends Base {

        public isRole(role: TExtendedRoleOptions): boolean {
            if (role == 'public') return true;
            if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
            let props = this.getAll();
            if (role in props) {
                return props[role as keyof TRoles] || props.admin || false;
            }
            return false;
        }

        public isaRole(roles: TExtendedRoleOptions[]): boolean {
            for (const role of roles) {
                const result = this.isRole(role);
                if (result) {
                    return true;
                }
            }
            return false;
        }

        public isRoleOrThrow(role: keyof TRoles): boolean {
            if (this.isRole(role)) {
                return true;
            }
            throw ouch(403, `Not a member of ${role}`, role);
        }

    };
    return RoleMixin as {
        new(...args: any): RoleMixin;
        prototype: any;
    } & T;
}

export const RoleOptions = ["admin", "developer"] as const;
export type TRoles = Pick<TProps<'User'>, ArrayToTuple<typeof RoleOptions>>;
export type TExtendedRoleOptions = keyof TRoles | "public" | "owner" | string;

export class UserRecord extends RoleMixin(VingRecord<'User'>) {

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
                this.setPassword(password)
                await this.update();
            }
            return true;
        }
        throw ouch(454, 'Password does not match.');
    }

    public setPassword(password: string) {
        this.set('password', bcrypt.hashSync(password, 10));
        this.set('passwordType', 'bcrypt');
    }

    public async describe(params?: DescribeParams) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            out.meta.displayName = this.displayName;
            out.meta.avatarUrl = this.avatarUrl;
        }
        if (params && params.include && params.include.extra && params.include.extra.includes('foo')) {
            if (out.extra === undefined) {
                out.extra = {};
            }
            out.extra.foo = 'foo';
        }
        return out;
    }

    public async verifyPostedParams(params: TProps<'User'>, currentUser?: UserRecord) {
        await super.verifyPostedParams(params, currentUser);
        if (params !== undefined && params.password && (currentUser === undefined || this.isOwner(currentUser))) {
            this.setPassword(params.password);
        }
        return true;
    }

    public get apiKeys() {
        return new APIKeyKind(prisma.aPIKey, APIKeyRecord, { userId: this.id });
    }

    public async update() {
        cache.set('user-changed-' + this.id, true, 1000 * 60 * 60 * 24 * 7);
        return await super.update();
    }

    public set<K extends keyof TProps<'User'>>(key: K, value: TProps<'User'>[K]) {
        if (key in ['password', ...RoleOptions]) {
            cache.set('user-changed-' + this.id, true, 1000 * 60 * 60 * 24 * 7);
        }
        if (key == 'email' && !(value?.toString().match(/.+@.+\..+/))) {
            throw ouch(442, `${value} doesn't look like an email address.`, key);
        }
        return super.set(key, value);
    }

}

export class UserKind extends VingKind<'User', UserRecord>  {
    // add custom Kind code here
}

export const Users = new UserKind(prisma.user, UserRecord);