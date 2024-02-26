import { Therapist } from 'src/users/therapist/therapist.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Categories extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'fa_name' })
  faName: string;

  @Column({ name: 'en_name' })
  enName: string;

  @ManyToMany(() => Therapist, (therapist) => therapist.workingFields)
  therapists: Therapist[];

  @Column({ name: 'icon', default: null })
  icon?: string;
}
