import { DescribeParams, Describe, RoleProps } from '../types';
import { useUsers, UserRecord } from './vingrecord/records/User';
const Users = useUsers();

import { RoleMixin, RoleOptions } from './vingrecord/mixins/Role';
import { ouch } from './helpers';
import { useCache } from './cache';
import { v4 } from 'uuid';

/*
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
*/


class ProtoSession {

    constructor(private props: RoleProps, public id = v4()) { }


    public get<K extends keyof RoleProps>(key: K): RoleProps[K] {
        return this.props[key];
    }

    public getAll() {
        return this.props;
    }

    private _userObj: UserRecord | undefined = undefined;

    public async user(userObj?: UserRecord) {
        if (userObj !== undefined) {
            return this._userObj = userObj;
        }
        if (this._userObj !== undefined) {
            return this._userObj;
        }
        return this._userObj = await Users.find(this.props.id) as UserRecord;
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
                for (const role of RoleOptions) {
                    this.props[role] = user.get(role);
                }
            }
        }
        await useCache().set('session-' + this.id, this.props, 1000 * 60 * 60 * 24 * 7);
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
        const data: RoleProps | undefined = await useCache().get('session-' + id);
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