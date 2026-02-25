import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EquipmentSet } from './equipment-set.entity';
import { CreateEquipmentSetDto } from './dto/create-equipment-set.dto';
import { UpdateEquipmentSetDto } from './dto/update-equipment-set.dto';
import { User } from '../user/entity/user.entity';

@Injectable()
export class EquipmentService {
  constructor(private readonly em: EntityManager) {}

  async create(
    userId: string,
    createDto: CreateEquipmentSetDto,
  ): Promise<EquipmentSet> {
    const user = this.em.getReference(User, userId);
    const set = new EquipmentSet();
    Object.assign(set, createDto);
    set.user = user;

    await this.em.persistAndFlush(set);
    return set;
  }

  async findAllForUser(userId: string): Promise<EquipmentSet[]> {
    return this.em.find(
      EquipmentSet,
      { user: { id: userId } },
      { orderBy: { createdAt: 'ASC' } },
    );
  }

  async findOne(id: string, userId: string): Promise<EquipmentSet> {
    const set = await this.em.findOne(EquipmentSet, { id });

    if (!set) {
      throw new NotFoundException(`Equipment set with ID ${id} not found`);
    }

    await this.em.populate(set, ['user']);

    if ((set.user as User).id !== userId) {
      throw new ForbiddenException();
    }

    return set;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateEquipmentSetDto,
  ): Promise<EquipmentSet> {
    const set = await this.findOne(id, userId);
    Object.assign(set, updateDto);
    await this.em.flush();
    return set;
  }

  async remove(id: string, userId: string): Promise<void> {
    const set = await this.findOne(id, userId);
    await this.em.removeAndFlush(set);
  }

  async bulkSync(
    userId: string,
    sets: CreateEquipmentSetDto[],
  ): Promise<EquipmentSet[]> {
    const user = this.em.getReference(User, userId);
    const created: EquipmentSet[] = [];

    for (const dto of sets) {
      const set = new EquipmentSet();
      Object.assign(set, dto);
      set.user = user;
      this.em.persist(set);
      created.push(set);
    }

    await this.em.flush();
    return created;
  }
}
