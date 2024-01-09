import { TherapistSchedules } from 'src/therapist-schedules/therapist-schedules.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Locations extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'city' })
  city: string;

  @Column({ name: 'address' })
  address: string;

  @OneToMany(
    () => TherapistSchedules,
    (therapistSchedules) => therapistSchedules.location,
  )
  therapistSchedules: TherapistSchedules[];
}
