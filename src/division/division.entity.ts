import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Rule } from '../rule/rule.entity';

@Entity()
export class Division {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @ManyToOne(() => Rule)
  rule: Rule;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
