import { Entity, Property, PrimaryKey, SerializedPrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';


@Entity()
export class Author {

    @PrimaryKey()
    @SerializedPrimaryKey()
    id: string = v4();

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    @Property()
    name!: string;

    @Property()
    email!: string;

    @Property()
    age?: number;

    @Property()
    termsAccepted = false;

    @Property()
    identities?: string[];

    @Property()
    born?: Date;

    @Property({ version: true })
    version!: number;

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }

}