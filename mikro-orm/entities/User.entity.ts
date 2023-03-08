import { EntitySchema } from '@mikro-orm/core';

export class User {

    id: string;
    email: string;
    agreedToTerms?: Date;
    firstName!: string;
    lastName!: string;

    constructor(id: string, email: string) {
        this.id = id;
        this.email = email;
    }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    agreeToTerms(): void {
        this.agreedToTerms = new Date();
    }

}

export const UserSchema = new EntitySchema<User>({
    class: User,
    tableName: 'person',
    properties: {
        id: { type: 'string', primary: true, name: 'cognito_id', foo: 'bar' },
        email: { type: 'string' },
        agreedToTerms: { type: 'datetime', nullable: true },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        fullName: { type: 'method', persist: false, getter: true },
    },
});