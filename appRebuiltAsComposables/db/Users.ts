import { prisma } from "./client";
import { useVingKind, useVingRecord, TModelName, TProps, DescribeParams, IPrisma, AuthorizedUser, VingRecord, Describe, useVingRecordOptions } from "./_Base";
//import { APIKeyKind, APIKeyRecord } from "./APIKeys";
import { ouch, ArrayToTuple } from '../helpers';
import bcrypt from 'bcrypt';
import { cache } from '../cache';

export type TRoleProps = TRoles & Pick<TProps<'User'>, 'id' | 'password'>;

export interface VingRole {
    isRole(role: TExtendedRoleOptions): boolean,
    isaRole(roles: TExtendedRoleOptions[]): boolean,
    isRoleOrThrow(role: keyof TRoles): boolean,
    getRoleProp<K extends keyof TRoleProps>(key: K): TRoleProps[K],
}

export function useVingRole({ getAll, props }: { getAll(): any, props: TRoleProps }) {

    const VingRole: VingRole = {
        isRole(role: TExtendedRoleOptions): boolean {
            if (role == 'public') return true;
            if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
            let props = getAll();
            if (role in props) {
                return props[role as keyof TRoles] || props.admin || false;
            }
            return false;
        },

        isaRole(roles: TExtendedRoleOptions[]): boolean {
            for (const role of roles) {
                const result = this.isRole(role);
                if (result) {
                    return true;
                }
            }
            return false;
        },

        isRoleOrThrow(role: keyof TRoles): boolean {
            if (this.isRole(role)) {
                return true;
            }
            throw ouch(403, `Not a member of ${role}`, role);
        },

        getRoleProp(key) {
            return props[key];
        },
    }

    return VingRole;

}

export const RoleOptions = ["admin", "developer"] as const;
export type TRoles = Pick<TProps<'User'>, ArrayToTuple<typeof RoleOptions>>;
export type TExtendedRoleOptions = keyof TRoles | "public" | "owner" | string;


export interface UserRecord extends VingRecord<'User'>, VingRole {
    displayName: string,
    avatarUrl: string,
    testPassword(password: string): Promise<boolean>,
    setPassword(password: string): void,
    describe(params: DescribeParams): Promise<Describe<'User'>>,
    verifyPostedParams(params: TProps<'User'>, currentUser?: AuthorizedUser): Promise<boolean>,
    // apiKeys:
    update(): Promise<TProps<'User'>>,
    set<K extends keyof TProps<'User'>>(key: K, value: TProps<'User'>[K]): TProps<'User'>[K],
}

export function useUserRecord(
    { prisma, props, inserted = true }:
        useVingRecordOptions<'User'>
) {
    const base = useVingRecord<'User'>({ prisma, props, inserted });
    const UserRecord: UserRecord = {
        ...base,
        ...useVingRole({ ...base, props }),

        get displayName() {
            switch (this.get('useAsDisplayName')) {
                case 'realName':
                    return this.get('realName') || '-unknown-';
                case 'email':
                    return this.get('email') || '-unknown-';
                default:
                    return this.get('username') || '-unknown-';
            }
        },

        get avatarUrl() {
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
        },

        async testPassword(password) {
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
        },

        setPassword(password) {
            this.set('password', bcrypt.hashSync(password, 10));
            this.set('passwordType', 'bcrypt');
        },

        async describe(params = {}) {
            const out = await base.describe(params);
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
        },

        async verifyPostedParams(params, currentUser) {
            base.verifyPostedParams(params, currentUser);
            if (params !== undefined && params.password && (currentUser === undefined || this.isOwner(currentUser))) {
                this.setPassword(params.password);
            }
            return true;
        },

        //   get apiKeys() {
        //      return new APIKeyKind(prisma.aPIKey, APIKeyRecord, { userId: this.id });
        //  },

        async update() {
            cache.set('user-changed-' + this.id, true, 1000 * 60 * 60 * 24 * 7);
            return await base.update();
        },

        set(key, value) {
            if (key in ['password', ...RoleOptions]) {
                cache.set('user-changed-' + this.id, true, 1000 * 60 * 60 * 24 * 7);
            }
            if (key == 'email' && !(value?.toString().match(/.+@.+\..+/))) {
                throw ouch(442, `${value} doesn't look like an email address.`, key);
            }
            return base.set(key, value);
        },

    }

    return UserRecord;
}

export function useUserKind<R extends typeof useUserRecord>(prisma: IPrisma<'User'>, recordComposable: R, propDefaults: TProps<'User'> = {}) {
    const base = useVingKind<'User', UserRecord>({ prisma, recordComposable, propDefaults });
    return {
        ...base
    }
}

export const Users = useUserKind(prisma.user, useUserRecord);