import { TherapistSchedules } from 'src/therapist-schedules/therapist-schedules.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TherapistSchedulesDayOff extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @ManyToOne(() => TherapistSchedules, {
    cascade: true,
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  schedule: TherapistSchedules;

  @Column({ name: 'date' })
  date: Date;
}
