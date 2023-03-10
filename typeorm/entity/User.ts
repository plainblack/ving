import { Entity, Column } from "typeorm";
import { VingRecord } from './VingRecord';

@Entity()
export class User extends VingRecord {

    @Column('text', { nullable: true })
    firstName?: string

    @Column('text', { nullable: true })
    lastName?: string

    @Column('integer')
    age?: number

}