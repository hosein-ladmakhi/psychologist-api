import { Categories } from 'src/categories/categories.entity';
import { Orders } from 'src/orders/orders.entity';
import { TherapistSchedules } from 'src/therapist-schedules/therapist-schedules.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum DegtreeOfEducation {
  diploma = 'diploma',
  associate = 'associate',
  bachelor = 'bachelor',
  master = 'master',
  doctorate = 'doctorate',
}

export enum Gender {
  male = 'male',
  female = 'female',
}

@Entity()
export class Therapist extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ name: 'phone2' })
  phone2: string;

  @Column({ name: 'bio' })
  bio: string;

  @Column({ name: 'address' })
  address: string;

  @Column({ name: 'degree_of_education' })
  degreeOfEducation: DegtreeOfEducation;

  @Column({ name: 'gender' })
  gender: Gender;

  @Column({ name: 'image' })
  image: string;

  @ManyToMany(() => Categories, (categories) => categories.therapists)
  @JoinTable()
  workingFields: Categories[];

  @OneToMany(
    () => TherapistSchedules,
    (therapistSchedules) => therapistSchedules.therapist,
  )
  schedules: TherapistSchedules[];

  @OneToMany(() => Orders, (order) => order.therapist)
  patientsOrders: Orders[];
}
