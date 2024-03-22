import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Admin extends BaseEntity {
    @PrimaryGeneratedColumn("rowid")
    id: number;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ name: 'phone' })
    phone: string;

    @Column({ name: 'is_active' })
    isActive?: boolean;

    @Column({ name: "password" })
    password: string;
}