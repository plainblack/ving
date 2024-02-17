import { VingRecord, VingKind } from "#ving/record/VingRecord.mjs";
import { RoleOptions, RoleMixin } from '#ving/record/mixins/Role.mjs';
import { useAPIKeys } from "#ving/record/records/APIKey.mjs";
import { useS3Files } from '#ving/record/records/S3File.mjs'
import bcrypt from 'bcryptjs';
import { useCache } from '#ving/cache.mjs';
import { useDB } from '#ving/drizzle/db.mjs';
import { UserTable } from '#ving/drizzle/schema/User.mjs';
import { ouch } from '#ving/utils/ouch.mjs';

export class UserRecord extends RoleMixin(VingRecord) {
    #userChanged = false;

    displayName() {
        switch (this.get('useAsDisplayName')) {
            case 'realName':
                return this.get('realName') || '-unknown-';
            case 'email':
                return this.get('email') || '-unknown-';
            default:
                return this.get('username') || '-unknown-';
        }
    }

    async avatarUrl() {
        switch (this.get('avatarType')) {
            case 'robot': {
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
            case 'uploaded': {
                if (this.get('avatarId')) {
                    const avatar = await this.avatar();
                    return avatar.fileUrl();
                }
                else {
                    break;
                }
            }
        }
        return '/img/avatar.png';
    }

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
    }

    async setPassword(password) {
        const hashedPass = bcrypt.hashSync(password, 10);
        this.set('password', hashedPass);
        this.set('passwordType', 'bcrypt');
    }

    async describe(params = {}) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            out.meta.displayName = this.displayName();
            out.meta.avatarUrl = await this.avatarUrl();
        }
        if (params && params.include && params.include.extra && params.include.extra.includes('foo')) {
            if (out.extra === undefined) {
                out.extra = {};
            }
            out.extra.foo = 'foo';
        }
        return out;
    }

    async setPostedProps(params, currentUser) {
        if (params.password && (currentUser === undefined || this.isOwner(currentUser))) {
            await this.setPassword(params.password);
        }
        if (params.email) {
            this.set('verifiedEmail', false);
        }
        await super.setPostedProps(params, currentUser);
        return true;
    }

    async update() {
        if (this.userChanged)
            await useCache().set('user-changed-' + this.get('id'), true, 1000 * 60 * 60 * 24 * 7);
        await super.update();
    }

    async delete() {
        await this.apikeys.deleteMany();
        await super.delete();
    }

    set(key, value) {
        if (key in ['password', ...RoleOptions])
            this.userChanged = true;
        return super.set(key, value);
    }

    get apikeys() {
        const apikeys = useAPIKeys();
        apikeys.propDefaults.push({
            prop: 'userId',
            field: apikeys.table.userId,
            value: this.get('id')
        });
        return apikeys;
    }

    async avatar() {
        return await useS3Files().findOrDie(this.get('avatarId'));
    }
}


export class UserKind extends VingKind {
    // add custom Kind code here
}


export const useUsers = () => {
    return new UserKind(useDB(), UserTable, UserRecord);
}