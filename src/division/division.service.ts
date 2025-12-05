import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Division } from './division.entity';
import { Rule } from '../rule/rule.entity';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionService {
  constructor(private readonly em: EntityManager) {}

  async create(createDivisionDto: CreateDivisionDto): Promise<Division> {
    const rule = await this.em.findOne(Rule, { id: createDivisionDto.ruleId });

    if (!rule) {
      throw new NotFoundException(
        `Rule with ID ${createDivisionDto.ruleId} not found`,
      );
    }

    const division = new Division();
    division.name = createDivisionDto.name;
    division.description = createDivisionDto.description;
    division.rule = rule;

    await this.em.persistAndFlush(division);
    return division;
  }

  async findAll(ruleId?: string): Promise<Division[]> {
    const where = ruleId ? { rule: { id: ruleId } } : {};
    return this.em.find(Division, where, { populate: ['rule'] });
  }

  async findOne(id: string): Promise<Division> {
    const division = await this.em.findOne(
      Division,
      { id },
      { populate: ['rule'] },
    );

    if (!division) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }

    return division;
  }

  async update(
    id: string,
    updateDivisionDto: UpdateDivisionDto,
  ): Promise<Division> {
    const division = await this.findOne(id);

    if (updateDivisionDto.ruleId) {
      const rule = await this.em.findOne(Rule, {
        id: updateDivisionDto.ruleId,
      });
      if (!rule) {
        throw new NotFoundException(
          `Rule with ID ${updateDivisionDto.ruleId} not found`,
        );
      }
      division.rule = rule;
    }

    if (updateDivisionDto.name) division.name = updateDivisionDto.name;
    if (updateDivisionDto.description)
      division.description = updateDivisionDto.description;

    await this.em.flush();
    return division;
  }

  async remove(id: string): Promise<void> {
    const division = await this.findOne(id);
    await this.em.removeAndFlush(division);
  }
}
