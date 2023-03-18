import { VingRecord, VingKind } from "../VingRecord";
import { ModelInsert, ModelSelect, DescribeParams, Describe, AuthorizedUser } from '../../../types';
import { RoleOptions, RoleMixin } from '../mixins/Role';

//import { APIKeyKind, APIKeyRecord } from "./APIKeys";
import { ouch } from '../../helpers';
import bcrypt from 'bcryptjs';
import { cache } from '../../cache';
import { db } from '../../drizzle/db';
import { UserTable } from '../../drizzle/schema/User';

/*

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
*/

export class UserRecord extends RoleMixin(VingRecord<'User'>) {
    private userChanged = false;

    public get displayName() {
        switch (this.get('useAsDisplayName')) {
            case 'realName':
                return this.get('realName') || '-unknown-';
            case 'email':
                return this.get('email') || '-unknown-';
            default:
                return this.get('username') || '-unknown-';
        }
    }

    public get avatarUrl() {
        const id = this.get('id');
        let url = `https://robohash.org/${id}/size_300x300`;

        // foreground
        if (this.get('id')?.match(/^[A-M]/)) {
            url += '/set_set2'
        }
        else if (this.get('id')?.match(/^[a-m]/)) {
            url += '/set_set3'
        }
        else if (id.match(/^[N-Z]/)) {
            url += '/set_set4'
        }

        // background
        if (id.match(/[A-Z]$/)) {
            url += '/bgset_bg1'
        }
        else if (id.match(/[a-z]$/)) {
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
    }

    public async setPassword(password: string) {
        const hashedPass = bcrypt.hashSync(password, 10);
        this.set('password', hashedPass);
        this.set('passwordType', 'bcrypt');
    }

    public async describe(params: DescribeParams = {}) {
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

    public async setPostedProps(params: ModelInsert<'User'>, currentUser?: AuthorizedUser) {
        if (params.password && (currentUser === undefined || this.isOwner(currentUser))) {
            await this.setPassword(params.password);
        }
        await super.setPostedProps(params, currentUser);
        return true;
    }

    //   public get apiKeys() {
    //      return new APIKeyKind(prisma.aPIKey, APIKeyRecord, { userId: this.id });
    //  }


    public async update() {
        if (this.userChanged)
            await cache.set('user-changed-' + this.get('id'), true, 1000 * 60 * 60 * 24 * 7);
        await super.update();
    }

    public set<K extends keyof ModelSelect<'User'>>(key: any /* K */, value: ModelSelect<'User'>[K]) {
        if (key in ['password', ...RoleOptions])
            this.userChanged = true;
        return super.set(key, value);
    }
}


export class UserKind extends VingKind<'User', UserRecord>  {
    // add custom Kind code here
}

export const Users = new UserKind(db, UserTable, UserRecord);