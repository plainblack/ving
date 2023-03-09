import { v4 } from 'uuid';
import { OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity<Optional = never> {

    [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

    @PrimaryKey()
    id = v4();

    @Property()
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

}