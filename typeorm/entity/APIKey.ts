import { Entity, Column, ManyToOne, RelationId } from "typeorm";
import { VingRecord, dbProps, stringDefault, VingRecordProps } from './VingRecord';
import { vingProp } from '../types';
import { User } from './User';
import { z } from "zod";
import { v4 } from 'uuid';

export type APIKeyProps = {
    name: string,
    url: string,
    reason: string,
    privateKey: string,
    userId: string,
} & VingRecordProps;

const _p: vingProp<'APIKey'>[] = [
    {
        name: 'name',
        required: true,
        db: { type: 'varchar', length: 60 },
        zod: z.string().min(1).max(60),
        unique: true,
        default: '',
        view: ['public'],
        edit: ['owner'],
    },
    {
        name: 'url',
        required: true,
        db: { type: 'text' },
        zod: z.string().url(),
        unique: true,
        default: '',
        view: [],
        edit: ['owner'],
    },
    {
        name: 'reason',
        required: false,
        default: '',
        db: { type: 'text' },
        zod: z.string(),
        view: [],
        edit: ['owner'],
    },
    {
        name: 'privateKey',
        required: false,
        default: () => 'pk_' + v4(),
        db: { type: 'varchar', length: 255 },
        view: [],
        edit: [],
    },
    {
        name: 'userId',
        required: true,
        db: { type: 'varchar', length: 36 },
        relation: {
            type: '1:n',
            name: 'user',
        },
        default: undefined,
        view: ['public'],
        edit: [],
    },
];

@Entity()
export class APIKey extends VingRecord<'APIKey'> {

    @Column(dbProps('name', _p))
    name = stringDefault('name', _p)

    @Column(dbProps('url', _p))
    url = stringDefault('url', _p)

    @Column(dbProps('reason', _p))
    reason = stringDefault('reason', _p)

    @Column(dbProps('privateKey', _p))
    privateKey = stringDefault('privateKey', _p)

    @ManyToOne(() => User, (user) => user.apikeys, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
    })
    user!: User

    @RelationId((apikey: APIKey) => apikey.user)
    userId!: string

    protected buildVingSchema() {
        const schema = super.buildVingSchema();
        schema.kind = 'APIKey';
        schema.owner.push('$userId');
        schema.props.push(..._p);
        return schema;
    }

}