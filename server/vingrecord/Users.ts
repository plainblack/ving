import { useVingKind, useVingRecord, VingRecord, useVingRecordOptions, useVingKindOptions } from "./VingRecord";
import { ModelInsert, ModelSelect, DescribeParams, Describe, AuthorizedUser } from '../../types';
import { RoleOptions, VingRole, useVingRole } from './VingRole';

//import { APIKeyKind, APIKeyRecord } from "./APIKeys";
import { ouch } from '../helpers';
import bcrypt from 'bcryptjs';
import { cache } from '../cache';
import { db } from '../drizzle/db';
import { UserTable } from '../drizzle/schema/User';



export interface UserRecord extends VingRecord<'User'>, VingRole {
    displayName: string,
    avatarUrl: string,
    testPassword(password: string): Promise<boolean>,
    setPassword(password: string): void,
    describe(params: DescribeParams): Promise<Describe<'User'>>,
    setPostedProps(params: ModelInsert<'User'>, currentUser?: AuthorizedUser): Promise<boolean>,
    // apiKeys:
    update(): Promise<void>,
    set<K extends keyof ModelSelect<'User'>>(key: K, value: ModelSelect<'User'>[K]): ModelSelect<'User'>[K],
}

export function useUserRecord(
    { db, table, props, inserted = true }:
        useVingRecordOptions<'User'>
) {
    const base = useVingRecord<'User'>({ db, table, props, inserted });
    let userChanged = false;

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
            if (this.get('id')?.match(/^[A-M]/)) {
                url += '/set_set2'
            }
            else if (this.get('id')?.match(/^[a-m]/)) {
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
                passed = await bcrypt.compare(password, this.get('password') || '');
            else
                throw ouch(404, 'validating other password types not implemented');
            if (passed) {
                if (this.get('passwordType') != 'bcrypt') {
                    await this.setPassword(password)
                    await this.update();
                }
                return true;
            }
            throw ouch(454, 'Password does not match.');
        },

        async setPassword(password) {
            const hashedPass = bcrypt.hashSync(password, 10);
            this.set('password', hashedPass);
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

        async setPostedProps(params, currentUser) {
            if (params.password && (currentUser === undefined || this.isOwner(currentUser))) {
                await this.setPassword(params.password);
            }
            await base.setPostedProps(params, currentUser);
            return true;
        },

        //   get apiKeys() {
        //      return new APIKeyKind(prisma.aPIKey, APIKeyRecord, { userId: this.id });
        //  },


        async update() {
            if (userChanged)
                await cache.set('user-changed-' + this.id, true, 1000 * 60 * 60 * 24 * 7);
            await base.update();
        },

        set(key, value) {
            if (key in ['password', ...RoleOptions])
                userChanged = true;
            return base.set(key, value);
        },

    }

    return UserRecord;
}

export function useUserKind<R extends typeof useUserRecord>({ db, table, recordComposable, propDefaults = {} }: useVingKindOptions<'User', UserRecord>) {
    const base = useVingKind<'User', UserRecord>({ db, table, recordComposable, propDefaults });
    return {
        ...base
    }
}

export const Users = useUserKind({ db, table: UserTable, recordComposable: useUserRecord, propDefaults: {} });