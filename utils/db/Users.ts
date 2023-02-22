import { prisma } from "./client";
import { VingKind, VingRecord, TProps, DescribeParams, IConstructable } from "./_Base";
import { APIKeyKind, APIKeyRecord } from "./APIKeys";
import { Ouch, ArrayToTuple } from '../utils';
import bcrypt from 'bcrypt';
import { cache } from '../cache';

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
            throw new Ouch(450, `Not a member of ${role}`, role);
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

    public async testPassword(password: string) {
        if (password == undefined || password == '' || this.get('password') == undefined)
            throw new Ouch(441, 'You must specify a password.');
        let passed = false;
        if (this.get('passwordType') == 'bcrypt')
            passed = bcrypt.compareSync(password, this.get('password') || '');
        else
            throw new Ouch(440, 'validating other password types not implemented');
        if (passed) {
            if (this.get('passwordType') != 'bcrypt') {
                this.setPassword(password)
                await this.update();
            }
            return true;
        }
        throw new Ouch(454, 'Password does not match.');
    }

    public setPassword(password: string) {
        this.set('password', bcrypt.hashSync(password, 10));
        this.set('passwordType', 'bcrypt');
    }

    public async describe(params?: DescribeParams) {
        const out = await super.describe(params);
        out.props.displayName = this.displayName;
        if (params && params.include && params.include.extra && params.include.extra.includes('foo')) {
            if (out.links === undefined) {
                out.links = {};
            }
            out.links.foo = 'foo';
        }
        return out;
    }

    public verifyPostedParams(params: TProps<'User'>, currentUser?: UserRecord) {
        super.verifyPostedParams(params, currentUser);
        if ('password' in params && params.password) {
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
        return super.set(key, value);
    }

}

export class UserKind extends VingKind<'User', UserRecord>  {
    // add custom Kind code here
}

export const Users = new UserKind(prisma.user, UserRecord);