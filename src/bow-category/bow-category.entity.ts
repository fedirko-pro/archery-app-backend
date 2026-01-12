import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Rule } from '../rule/rule.entity';

@Entity()
export class BowCategory {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  code: string; // Короткий код (FSC, LB, BBC, etc.)

  @Property()
  name: string;

  @Property({ nullable: true, columnType: 'text' })
  descriptionEn?: string;

  @Property({ nullable: true, columnType: 'text' })
  descriptionPt?: string;

  @Property({ nullable: true, columnType: 'text' })
  descriptionIt?: string;

  @Property({ nullable: true, columnType: 'text' })
  descriptionUk?: string;

  @Property({ nullable: true, columnType: 'text' })
  descriptionEs?: string;

  @Property({ nullable: true })
  ruleReference?: string; // Reference to specific rule section

  @Property({ nullable: true })
  ruleCitation?: string; // Citation text from the rule

  @ManyToOne(() => Rule)
  rule: Rule;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
