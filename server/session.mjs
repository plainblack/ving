import { useUsers, UserRecord } from './vingrecord/records/User.mjs';
import { ouch } from '../utils/ouch.mjs';
const Users = useUsers();

import { RoleMixin, RoleOptions } from './vingrecord/mixins/Role.mjs';
import { useCache } from './cache';
import { v4 } from 'uuid';

class ProtoSession {

    constructor(private props, public id = v4()) { }


    public get(key) {
        return this.props[key];
    }

    public getAll() {
        return this.props;
    }

    private _userObj = undefined;

    public async user(userObj) {
        if (userObj !== undefined) {
            return this._userObj = userObj;
        }
        if (this._userObj !== undefined) {
            return this._userObj;
        }
        return this._userObj = await Users.find(this.props.id);
    }

    public async end() {
        await useCache().delete('session-' + this.id);
    }

    public async extend() {
        const userChanged = await useCache().get('user-changed-' + this.props.id);
        if (userChanged) {
            const user = await this.user();
            if (this.props.password != user.get('password')) { // password changed since session created
                throw ouch(401, 'Session expired.');
            }
            else {
                this.props.verifiedEmail = user.get('verifiedEmail');
                for (const role of RoleOptions) {
                    this.props[role] = user.get(role);
                }
            }
        }
        await useCache().set('session-' + this.id, this.props, 1000 * 60 * 60 * 24 * 7);
    }

    public async describe(params) {
        const out: { props: { id, userId }, related, links, meta } = {
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