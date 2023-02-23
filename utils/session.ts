import { Users, UserRecord, TRoleProps, RoleMixin, RoleOptions } from './db';
import { ouch } from './utils';
import { cache } from './cache';
import crypto from 'crypto';

class ProtoSession {

    constructor(public props: TRoleProps, public id = crypto.randomUUID()) { }

    private userObj: UserRecord | undefined;

    public async user(userObj?: UserRecord) {
        if (userObj !== undefined) {
            return this.userObj = userObj;
        }
        if (this.userObj !== undefined) {
            return this.userObj;
        }
        return this.userObj = await Users.findUnique({ where: { id: this.props.id } });
    }

    public get<K extends keyof TRoleProps>(key: K): TRoleProps[K] {
        return this.props[key];
    }

    public getAll() {
        return this.props;
    }

    public async end() {
        await cache.delete('session-' + this.id);
    }

    public async extend() {
        const userChanged = await cache.get('user-changed-' + this.props.id);
        if (userChanged) {
            const user = await this.user();
            if (this.props.password != user.get('password')) { // password changed since session created
                throw ouch(401, 'Session expired.');
            }
            else {
                for (const role of RoleOptions) {
                    this.props[role] = user.get(role);
                }
            }
        }
        await cache.set('session-' + this.id, this.props, 1000 * 60 * 60 * 24 * 7);
    }

    static start(user: UserRecord) {
        const session = new Session(user.getAll());
        session.extend();
        return session;
    }

    static async fetch(id: string) {
        const data: TRoleProps | undefined = await cache.get('session-' + id);
        if (data !== undefined) {
            return new Session(data, id);
        }
        throw ouch(401, 'Session expired.');
    }

}

export class Session extends RoleMixin(ProtoSession) { }