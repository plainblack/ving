import { useUsers, UserRecord } from '../server/vingrecord/records/User.mjs';
import { ouch } from '../server/utils/ouch.mjs';
const Users = useUsers();

import { RoleMixin, RoleOptions } from '../server/vingrecord/mixins/Role.mjs';
import { useCache } from '#ving/cache.mjs';
import { v4 } from 'uuid';

class ProtoSession {

    #props = {};

    constructor(props, id = v4()) {
        this.#props = props;
        this.id = id;
    }


    get(key) {
        return this.#props[key];
    }

    getAll() {
        return this.#props;
    }

    #userObj = undefined;

    async user(userObj) {
        if (userObj !== undefined) {
            return this.#userObj = userObj;
        }
        if (this.#userObj !== undefined) {
            return this.#userObj;
        }
        return this.#userObj = await Users.find(this.#props.id);
    }

    async end() {
        await useCache().delete('session-' + this.id);
    }

    async extend() {
        const userChanged = await useCache().get('user-changed-' + this.#props.id);
        if (userChanged) {
            const user = await this.user();
            if (this.#props.password != user.get('password')) { // password changed since session created
                throw ouch(401, 'Session expired.');
            }
            else {
                this.#props.verifiedEmail = user.get('verifiedEmail');
                for (const role of RoleOptions) {
                    this.#props[role] = user.get(role);
                }
            }
        }
        await useCache().set('session-' + this.id, this.#props, 1000 * 60 * 60 * 24 * 7);
    }

    async describe(params) {
        const out = {
            props: {
                id: this.id,
                userId: this.get('id'),
            }
        };
        if ('include' in params && params.include !== undefined) {
            if (params.include.related && params.include.related.length) {
                out.related = {
                    user: await (await this.user()).describe(params)
                }
            }
            if (params.include.links) {
                out.links = {
                    base: '/api/user/session',
                    self: '/api/user/session/' + this.id,
                }
            }
            if (params.include.meta) {
                out.meta = {
                    type: 'Session',
                }
            }
        }
        return out;
    }

    static async start(user) {
        const session = new Session(user.getAll());
        await session.extend();
        return session;
    }

    static async fetch(id) {
        const data = await useCache().get('session-' + id);
        if (data !== undefined) {
            return new Session(data, id);
        }
        throw ouch(401, 'Session expired.');
    }
}

export class Session extends RoleMixin(ProtoSession) { }

export const testSession = (session) => {
    if (session === undefined) {
        throw ouch(401, 'Session expired.');
    }
}