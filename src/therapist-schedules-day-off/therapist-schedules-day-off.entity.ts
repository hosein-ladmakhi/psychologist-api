import { TherapistSchedules } from 'src/therapist-schedules/therapist-schedules.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TherapistSchedulesDayOff extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @ManyToOne(() => TherapistSchedules)
  @JoinColumn()
  schedule: TherapistSchedules;
}
