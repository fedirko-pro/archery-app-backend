import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
} from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Tournament } from './tournament.entity';
import { User } from '../user/entity/user.entity';
import { PatrolMember } from './patrol-member.entity';

@Entity()
export class Patrol {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @ManyToOne(() => Tournament)
  tournament: Tournament;

  @ManyToOne(() => User)
  leader: User;

  @OneToMany(() => PatrolMember, (member) => member.patrol)
  members = [];

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
