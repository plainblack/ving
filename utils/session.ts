import { Users, UserRecord } from './db';
import crypto from 'crypto';

export class Session {

    constructor(public userId: string, private passwordHash: string, public expires = new Date(), public id = crypto.randomUUID()) { }

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

    private get key() {
        return 'session-' + this.id;
    }


}