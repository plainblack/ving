import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
//import { VingRecord } from './VingRecord';

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column('text', { nullable: true })
    firstName?: string

    @Column('text', { nullable: true })
    lastName?: string

    @Column('integer')
    age?: number

}