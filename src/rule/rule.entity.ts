import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Exclude } from 'class-transformer';
import { Division } from '../division/division.entity';
import { BowCategory } from '../bow-category/bow-category.entity';

@Entity()
export class Rule {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  ruleCode: string; // e.g., "IFAA", "FABP", "HDH-IAA"

  @Property()
  ruleName: string; // Full official name

  @Property({ nullable: true })
  edition?: string; // e.g., "18th Edition, 2021–2022"

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
  link?: string; // Official website link

  @Property({ nullable: true })
  downloadLink?: string; // PDF download link

  @Exclude()
  @OneToMany(() => Division, (division) => division.rule)
  divisions = new Collection<Division>(this);

  @Exclude()
  @OneToMany(() => BowCategory, (bowCategory) => bowCategory.rule)
  bowCategories = new Collection<BowCategory>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
