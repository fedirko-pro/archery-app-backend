import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';

@Entity()
export class TrainingSession {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user: User;

  @Property({ type: 'date' })
  date: string;

  @Property({ nullable: true })
  shotsCount?: number;

  @Property({ nullable: true, default: 'finished' })
  status?: string;

  @Property({ nullable: true })
  arrowsPerSet?: number;

  @Property({ nullable: true })
  scoreTotal?: number;

  @Property({ nullable: true })
  notes?: string;

  @Property({ nullable: true })
  mood?: string;

  @Property({ nullable: true })
  distance?: string;

  @Property({ nullable: true })
  targetType?: string;

  /** References the server-side equipment set id (nullable) */
  @Property({ nullable: true })
  equipmentSetId?: string;

  @Property({ type: 'json', nullable: true })
  customFields?: Array<{ key: string; value: string }>;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
