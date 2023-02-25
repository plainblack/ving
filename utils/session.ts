import { Users, UserRecord, TRoleProps, RoleMixin, RoleOptions, DescribeParams, Describe } from './db';
import { ouch } from './helpers';
import { cache } from './cache';
import crypto from 'crypto';

class ProtoSession {

    constructor(private props: TRoleProps, public id = crypto.randomUUID()) { }

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

    public async describe(params: DescribeParams = {}) {
        const out: { props: { id: string, userId?: string }, related?: { user: Describe<'User'> }, links?: Record<string, string>, meta?: Record<string, any> } = {
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

    static async start(user: UserRecord) {
        const session = new Session(user.getAll());
        await session.extend();
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

export const testSession = (session: Session | undefined) => {
    if (session === undefined) {
        throw ouch(401, 'Session expired.');
    }
}