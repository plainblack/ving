import { Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, CreateDateColumn } from "typeorm";

@Entity()
export abstract class VingRecord extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id!: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt!: Date;

}