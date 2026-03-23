import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Country } from '../country/country.entity';

@Entity()
export class Federation {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ unique: true })
  shortCode: string;

  /** Country (ISO code) that this federation belongs to */
  @ManyToOne({ entity: () => Country, nullable: false })
  country: Country;

  /** URL to federation logo image */
  @Property({ nullable: true })
  logo?: string;

  /** Public federation website */
  @Property({ nullable: true })
  url?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
