import { DescribeParams, Describe, RoleProps } from '../types';
import { Users, UserRecord } from './vingrecord/records/Users';
import { useVingRole, VingRole, RoleOptions } from './vingrecord/mixins/Role';
import { ouch } from './helpers';
import { cache } from './cache';
import { v4 } from 'uuid';

export interface Session extends VingRole {
    _userObj: UserRecord | undefined,
    user(userObj?: UserRecord): Promise<UserRecord>,
    getAll(): Describe<'User'>['props'],
    end(): void,
    extend(): void,
    describe(params: DescribeParams): Promise<Describe<'User'>>,
    start(user: UserRecord): Promise<Session>,
    fetch(id: string): Promise<Session>,
}

export function useSession(props: RoleProps, id = v4()) {

    const getAll = () => {
        return props;
    }

    const Session: Session = {

        ...useVingRole({ getAll, props }),
        getAll,

        _userObj: undefined,

        async user(userObj) {
            if (userObj !== undefined) {
                return this._userObj = userObj;
            }
            if (this._userObj !== undefined) {
                return this._userObj;
            }
            return this._userObj = await Users.find(props.id) as UserRecord;
        },

        async end() {
            await cache.delete('session-' + id);
        },

        async extend() {
            const userChanged = await cache.get('user-changed-' + props.id);
            if (userChanged) {
                const user = await this.user();
                if (props.password != user.get('password')) { // password changed since session created
                    throw ouch(401, 'Session expired.');
                }
                else {
                    for (const role of RoleOptions) {
                        props[role] = user.get(role);
                    }
                }
            }
            await cache.set('session-' + id, props, 1000 * 60 * 60 * 24 * 7);
        },

        async describe(params = {}) {
            const out: { props: { id: string, userId?: string }, related?: { user: Describe<'User'> }, links?: Record<string, string>, meta?: Record<string, any> } = {
                props: {
                    id: id,
                    userId: this.getRoleProp('id'),
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
                        self: '/api/user/session/' + id,
                    }
                }
                if (params.include.meta) {
                    out.meta = {
                        type: 'Session',
                    }
                }
            }
            return out;
        },

        async start(user) {
            const session = useSession(user.getAll());
            await session.extend();
            return session;
        },

        async fetch(id: string) {
            const data: RoleProps | undefined = await cache.get('session-' + id);
            if (data !== undefined) {
                return useSession(data, id);
            }
            throw ouch(401, 'Session expired.');
        },
    }
    return Session;

}

export const testSession = (session: Session | undefined) => {
    if (session === undefined) {
        throw ouch(401, 'Session expired.');
    }
}