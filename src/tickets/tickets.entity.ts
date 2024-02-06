import { jsonTransformer } from 'src/core/utils/json-transformer';
import { Patient } from 'src/users/patient/patient.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TicketStatus {
  Open = 'Open',
  Close = 'Close',
  Report = 'Report',
}

@Entity({ name: '_tickets' })
export class Tickets extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({
    name: 'attachments',
    type: 'text',
    default: '[]',
    transformer: jsonTransformer,
  })
  attachments: string[] = [];

  @Column({ name: 'status', default: TicketStatus.Open })
  status: TicketStatus;

  @ManyToOne(() => Patient)
  @JoinColumn()
  patient: Patient;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'close_at', default: null })
  closeAt?: Date;

  @Column({ name: 'title' })
  title: string;

  @OneToMany(() => Tickets, (c) => c.parent, { nullable: true })
  childrens: Tickets[];

  @ManyToOne(() => Tickets, (p) => p.childrens, { nullable: true })
  @JoinColumn()
  parent: Tickets;
}
