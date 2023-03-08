import { EntitySchema } from '@mikro-orm/core';
import { Base } from './Base.entity';

export class User extends Base {

    public agreedToTerms?: Date;

    constructor(public email: string, public firstName: string, public lastName: string) {
        super();
    }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    agreeToTerms(): void {
        this.agreedToTerms = new Date();
    }

}

export const UserSchema = new EntitySchema<User, Base>({
    class: User,
    tableName: 'person',
    properties: {
        email: { type: 'string' },
        agreedToTerms: { type: 'datetime', nullable: true },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        fullName: { type: 'method', persist: false, getter: true },
    },
});