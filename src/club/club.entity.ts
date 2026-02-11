import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
export class Club {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;

  /** Short code for score cards etc., e.g. "KSP" for "Kyiv Sport Club" */
  @Property({ nullable: true })
  shortCode?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  location?: string;

  @Property({ nullable: true })
  clubLogo?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
