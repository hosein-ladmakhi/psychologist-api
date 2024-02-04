import { Categories } from 'src/categories/categories.entity';
import { jsonTransformer } from 'src/core/utils/json-transformer';
import { TherapistScheduleType } from 'src/therapist-schedules/therapist-schedules.entity';
import { UserDocumentation } from 'src/user-documentation/user-documentation.entity';
import { Patient } from 'src/users/patient/patient.entity';
import { Therapist } from 'src/users/therapist/therapist.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

enum OrderStatus {
  Done = 'Done',
  Cancel = 'Cancel',
  Pending = 'Pending',
}

@Entity()
export class Orders extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @OneToMany(() => UserDocumentation, (ud) => ud.order)
  documentation: UserDocumentation[];

  @ManyToOne(() => Patient, (patient) => patient.orders)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => Therapist, (therapist) => therapist.patientsOrders)
  @JoinColumn()
  therapist: Therapist;

  @Column({ name: 'day' })
  day: number;

  @Column({ name: 'city' })
  city: string;

  @Column({ name: 'address' })
  address: string;

  @Column({ name: 'date' })
  date: string;

  @Column({ name: 'room' })
  room: number;

  @Column({ name: 'categories', transformer: jsonTransformer, type: 'text' })
  categories: { enName: string; faName: string }[];

  @Column({ name: 'type' })
  type: TherapistScheduleType;

  @Column({ name: 'start_hour' })
  startHour: string;

  @Column({ name: 'end_hour' })
  endHour: string;

  @Column({ name: 'status', default: OrderStatus.Pending })
  status: OrderStatus = OrderStatus.Pending;
}
