import { Orders } from 'src/orders/orders.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserDocumentation extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'file' })
  file: string;

  @ManyToOne(() => Orders)
  @JoinColumn()
  order: Orders;
}
