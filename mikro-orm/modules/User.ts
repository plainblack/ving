import { EntityRepository } from '@mikro-orm/mysql';
import {
    BeforeCreate, BeforeUpdate, Embeddable, Embedded,
    Entity, EntityRepositoryType, EventArgs, Property,
} from '@mikro-orm/core';
import { hash, verify } from 'argon2';
import { BaseEntity } from './Base';
import { ouch } from '../../server/helpers';

export class UserRepository extends EntityRepository<User> {

    async exists(email: string) {
        const count = await this.qb().where({ email }).getCount();
        return count > 0;
    }

    async login(email: string, password: string) {
        // use more generic error so we dont leak such email is registered
        const err = ouch(454, 'Password does not match.');
        const user = await this.findOneOrFail({ email }, { // <--- need to do username lookup
            populate: ['password', 'passwordType'], // password is a lazy property, we need to populate it
            failHandler: () => err,
        });

        if (await user.verifyPassword(password)) {
            return user;
        }

        throw err;
    }

}


@Embeddable()
export class Social {

    @Property()
    twitter?: string;

    @Property()
    facebook?: string;

    @Property()
    linkedin?: string;

}

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity<'bio'> {

    [EntityRepositoryType]?: UserRepository;

    @Property()
    username: string;

    @Property()
    realName: string;

    @Property({ hidden: true })
    email: string;

    @Property({ hidden: true, lazy: true })
    password?: string;

    @Property({ hidden: true, lazy: true })
    passwordType = 'argon2';

    @Property({ type: 'text' })
    bio = '';

    @Property({ persist: false })
    token?: string;

    @Embedded(() => Social, { object: true })
    social?: Social;

    constructor(username: string, email: string) {
        super();
        this.username = username;
        this.realName = email;
        this.email = email;
    }

    @BeforeCreate()
    @BeforeUpdate()
    async hashPassword(args: EventArgs<User>) {
        // hash only if the value changed
        const password = args.changeSet?.payload.password;

        if (password) {
            this.password = await hash(password);
        }
    }

    async verifyPassword(password: string) {
        if (this.password == undefined)
            throw ouch(400, 'User has no password, you must log in via another provider.');
        if (password == undefined || password == '')
            throw ouch(441, 'You must specify a password.');
        let passed = false;
        if (this.passwordType == 'argon2')
            passed = await verify(this.password, password);
        else
            throw ouch(404, 'validating other password types not implemented');
        if (passed) {
            if (this.passwordType != 'argon2') {
                this.password = password;
                //  await this.update(); <---need to figure out how to save
            }
            return true;
        }
        ouch(454, 'Password does not match.')
    }

}

