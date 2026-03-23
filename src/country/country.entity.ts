import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Country {
  /** ISO 3166-1 alpha-2 code, e.g. "PT" */
  @PrimaryKey({ length: 2 })
  code: string;

  @Property()
  name: string;

  @Property({ nullable: true })
  flagEmoji?: string;

  @Property({ default: true })
  enabled: boolean = true;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
