import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';

@Entity()
export class EquipmentSet {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user: User;

  @Property()
  name: string;

  @Property({ nullable: true })
  bowType?: string; // 'bow' | 'crossbow'

  @Property({ nullable: true })
  manufacturer?: string;

  @Property({ nullable: true })
  model?: string;

  @Property({ nullable: true })
  drawWeight?: string;

  @Property({ nullable: true })
  arrowLength?: string;

  @Property({ nullable: true })
  arrowSpine?: string;

  @Property({ nullable: true })
  arrowWeight?: string;

  @Property({ nullable: true })
  arrowMaterial?: string;

  @Property({ type: 'json', nullable: true })
  customFields?: Array<{ key: string; value: string }>;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
