import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Unique,
} from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Tournament } from './tournament.entity';
import { User } from '../user/entity/user.entity';

@Entity()
@Unique({ properties: ['tournament', 'user'] })
export class TournamentFeedback {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Tournament)
  tournament: Tournament;

  @ManyToOne(() => User)
  user: User;

  @Property({ type: 'smallint' })
  rating: number;

  @Property({ nullable: true, length: 2000 })
  comment?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
