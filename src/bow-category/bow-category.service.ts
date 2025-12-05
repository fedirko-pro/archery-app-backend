import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BowCategory } from './bow-category.entity';
import { Rule } from '../rule/rule.entity';
import { CreateBowCategoryDto } from './dto/create-bow-category.dto';
import { UpdateBowCategoryDto } from './dto/update-bow-category.dto';

@Injectable()
export class BowCategoryService {
  constructor(private readonly em: EntityManager) {}

  async create(
    createBowCategoryDto: CreateBowCategoryDto,
  ): Promise<BowCategory> {
    // Check if bow category with this code already exists
    const existingBowCategory = await this.em.findOne(BowCategory, {
      code: createBowCategoryDto.code,
    });

    if (existingBowCategory) {
      throw new BadRequestException(
        `Bow category with code ${createBowCategoryDto.code} already exists`,
      );
    }

    // Find the rule
    const rule = await this.em.findOne(Rule, {
      id: createBowCategoryDto.ruleId,
    });
    if (!rule) {
      throw new NotFoundException(
        `Rule with ID ${createBowCategoryDto.ruleId} not found`,
      );
    }

    const bowCategory = new BowCategory();
    Object.assign(bowCategory, createBowCategoryDto);
    bowCategory.rule = rule;

    await this.em.persistAndFlush(bowCategory);
    return bowCategory;
  }

  async findAll(ruleId?: string): Promise<BowCategory[]> {
    const where = ruleId ? { rule: { id: ruleId } } : {};
    return this.em.find(BowCategory, where, {
      orderBy: { code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<BowCategory> {
    const bowCategory = await this.em.findOne(BowCategory, { id });

    if (!bowCategory) {
      throw new NotFoundException(`Bow category with ID ${id} not found`);
    }

    return bowCategory;
  }

  async findByCode(code: string): Promise<BowCategory> {
    const bowCategory = await this.em.findOne(BowCategory, { code });

    if (!bowCategory) {
      throw new NotFoundException(`Bow category with code ${code} not found`);
    }

    return bowCategory;
  }

  async update(
    id: string,
    updateBowCategoryDto: UpdateBowCategoryDto,
  ): Promise<BowCategory> {
    const bowCategory = await this.findOne(id);

    // If updating code, check if new code is already taken
    if (
      updateBowCategoryDto.code &&
      updateBowCategoryDto.code !== bowCategory.code
    ) {
      const existingBowCategory = await this.em.findOne(BowCategory, {
        code: updateBowCategoryDto.code,
      });

      if (existingBowCategory) {
        throw new BadRequestException(
          `Bow category with code ${updateBowCategoryDto.code} already exists`,
        );
      }
    }

    // If updating ruleId, verify the rule exists
    if (updateBowCategoryDto.ruleId) {
      const rule = await this.em.findOne(Rule, {
        id: updateBowCategoryDto.ruleId,
      });
      if (!rule) {
        throw new NotFoundException(
          `Rule with ID ${updateBowCategoryDto.ruleId} not found`,
        );
      }
      bowCategory.rule = rule;
    }

    Object.assign(bowCategory, updateBowCategoryDto);
    await this.em.flush();

    return bowCategory;
  }

  async remove(id: string): Promise<void> {
    const bowCategory = await this.em.findOne(BowCategory, { id });

    if (!bowCategory) {
      throw new NotFoundException(`Bow category with ID ${id} not found`);
    }

    await this.em.removeAndFlush(bowCategory);
  }
}
