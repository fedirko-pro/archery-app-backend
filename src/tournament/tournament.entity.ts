import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
} from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';
import { Patrol } from './patrol.entity';

@Entity()
export class Tournament {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  title: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true, type: 'json' })
  locationCoords?: { lat: number; lng: number };

  @Property()
  startDate: Date;

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ nullable: true })
  applicationDeadline?: Date;

  @Property({ default: true })
  allowMultipleApplications: boolean = true;

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => Patrol, (patrol) => patrol.tournament)
  patrols = [];

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
