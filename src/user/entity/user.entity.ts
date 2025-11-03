import { Entity, PrimaryKey, Property, OneToMany } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { AuthProvider, AuthProviders } from '../types';
import { Tournament } from '../../tournament/tournament.entity';
import { PatrolMember } from '../../tournament/patrol-member.entity';

@Entity()
export class User {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  role: string;

  @Property()
  email: string;

  @Property({ nullable: true, hidden: true })
  password?: string;

  @Property()
  authProvider: AuthProvider = AuthProviders.Local;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  picture?: string;

  @Property({ nullable: true })
  bio?: string;

  @Property({ nullable: true })
  location?: string;

  @Property({ nullable: true })
  appLanguage?: string;

  @Property({ nullable: true, hidden: true })
  resetPasswordToken?: string;

  @Property({ nullable: true, hidden: true })
  resetPasswordExpires?: Date;

  @Property({ nullable: true })
  federationNumber?: string;

  @Property({ type: 'array', nullable: true })
  categories?: string[];

  @OneToMany(() => Tournament, (tournament) => tournament.createdBy)
  tournaments = [];

  @OneToMany(() => PatrolMember, (member) => member.user)
  patrolMemberships = [];

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
