import { VingRecord, VingKind } from "#ving/record/VingRecord.mjs";
import { RoleOptions, RoleMixin } from '#ving/record/mixins/Role.mjs';
import bcrypt from 'bcryptjs';
import { useCache } from '#ving/cache.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { eq } from '#ving/drizzle/orm.mjs';
import { isUndefined, isNil } from '#ving/utils/identify.mjs';
import { stringifyId } from '#ving/utils/int2str.mjs';

/** Management of individual Users.
 * @class
 */
export class UserRecord extends RoleMixin(VingRecord) {
    #userChanged = false;

    /**
     * Generates the name that the user would like to be known as on the site based upon their `useAsDisplayName` preference.
     * 
     * @returns {string} a string
     * @example
     * const name = user.displayName()
     */
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

    /**
     * Returns a URL to an image that represents the identity of this user. Note that it could be a fully qualified URL or a partial URL.
     * 
     * @returns {string} A URL to an image. 
     * @example
     * const url = await user.avatarUrl();
     */
    async avatarUrl() {
        switch (this.get('avatarType')) {
            case 'robot': {
                const id = stringifyId(this.get('id'));
                let url = `https://robohash.org/${id}/size_300x300`;

                // foreground
                if (id.match(/[A-M]$/)) {
                    url += '/set_set2'
                }
                else if (id.match(/[a-m]$/)) {
                    url += '/set_set3'
                }
                else if (id.match(/[N-Z]$/)) {
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
                    const avatar = await this.parent('avatar');
                    return avatar.fileUrl();
                }
                else {
                    break;
                }
            }
        }
        return '/img/avatar.png';
    }

    /**
     * Tests a potential password to see if it matches the password stored in the user's account.
     * 
     * @throws 400 if the user doesn't have a password set
     * @throws 441 if no password is passed into the function
     * @throws 404 if the user has a `passwordType` other than those allowed
     * @param {string} password the password you'd like to test against the user's set password
     * @returns {boolean} `true` if it passes, or `false` if it fails to pass
     * @example
     * const result = await testPassword('totaly going to work');
     */
    async testPassword(password) {
        if (isNil(this.get('password')))
            throw ouch(400, 'User has no password, you must log in via another provider.');
        if (isNil(password))
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

    /**
     * Sets a password for this user. Note that passwords cannot be set through the normal `set()` function.
     * 
     * @param {string} password A string that will act as the user's password.
     * @example
     * await user.setPassword('my new cool password');
     */
    async setPassword(password) {
        const hashedPass = bcrypt.hashSync(password, 10);
        this.set('password', hashedPass);
        this.set('passwordType', 'bcrypt');
    }

    /**
        * Extends `describe()` in `VingRecord` to add `meta` properties `displayName`
        *  and `avatarUrl`.
        * 
        * @see VingRecord.describe()
        */
    async describe(params = {}) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            out.meta.displayName = this.displayName();
        }
        return out;
    }

    /**
     * Extends `describeLinks()` in `VingRecord`.
     * @see VingRecord.describeLinks()
     */
    async describeLinks(idString, restVersion, schema, params = {}) {
        const links = await super.describeLinks(idString, restVersion, schema, params);
        links.profile = { href: `/users/${idString}/profile`, methods: ['GET'], usage: 'page' };
        links.logout = { href: '/users/logout', methods: ['GET'], usage: 'page' };
        links.list = { href: '/users/admin', methods: ['GET'], usage: 'page' };
        links.edit = { href: `/users/admin/${idString}`, methods: ['GET'], usage: 'page' };
        links.settings = { href: '/users/settings', methods: ['GET'], usage: 'page' };
        links.preferences = { href: '/users/settings/preferences', methods: ['GET'], usage: 'page' };
        links.listApikeys = { href: '/users/settings/apikeys', methods: ['GET'], usage: 'page' };
        links.account = { href: '/users/settings/account', methods: ['GET'], usage: 'page' };
        links.messagebus = { href: `${links.base.href}/messagebus`, methods: ['GET'], usage: 'rest' };
        links.avatarImage = { href: await this.avatarUrl(), methods: ['GET'], usage: 'image' };
        links.describeAvatar = { href: `${links.self.href}/avatar`, methods: ['GET'], usage: 'rest' };
        links.importAvatar = { href: `${links.self.href}/import-avatar`, methods: ['PUT'], usage: 'rest' };
        return links;
    }

    /**
       * Extends `setPostedProps()` in `VingRecord` to enable password security.
       * 
       * @see VingRecord.setPostedProps()
       */
    async setPostedProps(params, currentUser) {
        if (params.password && (isUndefined(currentUser) || await this.isOwner(currentUser))) {
            await this.setPassword(params.password);
        }
        if ('email' in params && params.email != this.get('email')) {
            this.set('verifiedEmail', false);
        }
        await super.setPostedProps(params, currentUser);
        return true;
    }

    /**
        * Extends `update()` in `VingRecord` to enable change detection in user records.
        * 
        * @see VingRecord.update()
        */
    async update() {
        if (this.#userChanged)
            await useCache().set('user-changed-' + this.get('id'), true, 1000 * 60 * 60 * 24 * 7);
        await super.update();
    }

    /**
         * Extends `delete()` in `VingRecord` to delete APIKeys and S3Files the user created.
         * 
         * @see VingRecord.delete()
         */
    async delete() {
        await (await this.children('apikeys')).deleteMany();
        await (await this.children('s3files')).deleteMany();
        await super.delete();
    }

    /**
         * Extends `set()` in `VingRecord` to enable change detection in user records.
         * 
         * @see VingRecord.set()
         */
    set(key, value) {
        if (key in ['password', ...RoleOptions])
            this.#userChanged = true;
        return super.set(key, value);
    }
}

/** Management of all Users.
 * @class
 */
export class UserKind extends VingKind {
    /**
     * Find users with a matching role.
     * @param {string} role A role name as defined in `#ving/schema/schemas/User.mjs`
     * @returns {UserRecord[]} a list of `UserRecord`s where the specified role is true
     */
    async findWithRole(role) {
        return await this.select.findMany(eq(this.table[role], true));
    }

}