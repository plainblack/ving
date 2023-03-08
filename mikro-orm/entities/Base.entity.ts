import { EntitySchema } from '@mikro-orm/core';
import { v4 } from 'uuid';

export class Base {

    constructor(public id = v4(), public createdAt = new Date(), public updatedAt = new Date()) { }

    public get getProperties() {
        return Object.keys(this);
    }
}

export const BaseSchema = new EntitySchema<Base>({
    class: Base,
    abstract: true,
    properties: {
        id: { type: 'string', primary: true },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date', onUpdate: () => new Date() },
        getProperties: { type: 'method', persist: false, getter: true },
    },
});