import { Locations } from 'src/locations/locations.entity';
import { TherapistSchedulesDayOff } from 'src/therapist-schedules-day-off/therapist-schedules-day-off.entity';
import { Therapist } from 'src/users/therapist/therapist.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TherapistScheduleType {
  online = 'online',
  onsite = 'onsite',
  both = 'both',
}

@Entity()
export class TherapistSchedules extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @ManyToOne(() => Therapist, (therapist) => therapist.schedules)
  @JoinColumn()
  therapist: Therapist;

  @Column({ name: 'day' })
  day: number;

  @Column({ name: 'start_hour' })
  startHour: string;

  @Column({ name: 'end_hour' })
  endHour: string;

  @ManyToOne(() => Locations, (location) => location.therapistSchedules, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  location: Locations;

  @Column({ name: 'type' })
  type: TherapistScheduleType;

  @Column({ name: 'room' })
  room: number;

  @OneToMany(() => TherapistSchedulesDayOff, (element) => element.schedule)
  daysOff: TherapistSchedulesDayOff[];
}
