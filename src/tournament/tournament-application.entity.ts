import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Tournament } from './tournament.entity';
import { User } from '../user/entity/user.entity';
import { Division } from '../division/division.entity';
import { BowCategory } from '../bow-category/bow-category.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity()
export class TournamentApplication {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Tournament)
  tournament: Tournament;

  @ManyToOne(() => User)
  applicant: User;

  @Property({ type: 'string' })
  status: ApplicationStatus = ApplicationStatus.PENDING;

  @ManyToOne(() => Division, { nullable: true })
  division?: Division; // Дивізіон учасника

  @ManyToOne(() => BowCategory, { nullable: true })
  bowCategory?: BowCategory; // Категорія лука

  @Property({ nullable: true })
  notes?: string; // Додаткові нотатки

  @Property({ nullable: true })
  rejectionReason?: string; // Причина відхилення

  @ManyToOne(() => User, { nullable: true })
  processedBy?: User; // Адміністратор, який обробив заявку

  @Property({ nullable: true })
  processedAt?: Date; // Час обробки заявки

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
