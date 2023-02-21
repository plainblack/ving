import { Users, UserRecord } from './db';
import { Ouch } from './utils';
import { cache } from './cache';
import crypto from 'crypto';

export class Session {

    constructor(public userId: string, private passwordHash?: string, public id = crypto.randomUUID()) { }

    private userObj: UserRecord | undefined;

    public async user(userObj?: UserRecord) {
        if (userObj !== undefined) {
            return this.userObj = userObj;
        }
        if (this.userObj !== undefined) {
            return this.userObj;
        }
        return this.userObj = await Users.findUnique({ where: { id: this.userId } });
    }

    public async end() {
        await cache.delete('session-' + this.id);
    }

    public async extend() {
        const user = await this.user();
        if (this.passwordHash != user.props.password) { // password changed since session created
            this.end();
            return;
        }
        await cache.set('session-' + this.id, {
            userId: this.userId,
            passwordHash: this.passwordHash,
        }, 1000 * 60 * 60 * 24 * 7);
    }

    static start(user: UserRecord) {
        const session = new Session(user.props.id as string, user.props.password || '');
        session.extend();
        return session;
    }

    static async fetch(id: string) {
        const data: { userId: string, passwordHash: string } | undefined = await cache.get('session-' + id);
        if (data !== undefined) {
            return new Session(data.userId, data.passwordHash, id);
        }
        throw new Ouch(451, 'Session expired.');
    }

}