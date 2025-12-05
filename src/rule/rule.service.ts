import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Rule } from './rule.entity';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RuleService {
  constructor(private readonly em: EntityManager) {}

  async create(createRuleDto: CreateRuleDto): Promise<Rule> {
    // Check if rule with this code already exists
    const existingRule = await this.em.findOne(Rule, {
      ruleCode: createRuleDto.ruleCode,
    });

    if (existingRule) {
      throw new BadRequestException(
        `Rule with code ${createRuleDto.ruleCode} already exists`,
      );
    }

    const rule = new Rule();
    Object.assign(rule, createRuleDto);

    await this.em.persistAndFlush(rule);
    return rule;
  }

  async findAll(): Promise<Rule[]> {
    return this.em.find(
      Rule,
      {},
      {
        orderBy: { ruleCode: 'ASC' },
      },
    );
  }

  async findOne(id: string): Promise<Rule> {
    const rule = await this.em.findOne(Rule, { id });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }

    return rule;
  }

  async findByCode(ruleCode: string): Promise<Rule> {
    const rule = await this.em.findOne(Rule, { ruleCode });

    if (!rule) {
      throw new NotFoundException(`Rule with code ${ruleCode} not found`);
    }

    return rule;
  }

  async update(id: string, updateRuleDto: UpdateRuleDto): Promise<Rule> {
    const rule = await this.findOne(id);

    // If updating ruleCode, check if new code is already taken
    if (updateRuleDto.ruleCode && updateRuleDto.ruleCode !== rule.ruleCode) {
      const existingRule = await this.em.findOne(Rule, {
        ruleCode: updateRuleDto.ruleCode,
      });

      if (existingRule) {
        throw new BadRequestException(
          `Rule with code ${updateRuleDto.ruleCode} already exists`,
        );
      }
    }

    Object.assign(rule, updateRuleDto);
    await this.em.flush();

    return rule;
  }

  async remove(id: string): Promise<void> {
    const rule = await this.em.findOne(Rule, { id });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }

    // Load collections to check if there are any related entities
    await this.em.populate(rule, ['divisions', 'bowCategories']);

    // Check if rule has associated divisions or bow categories
    if (rule.divisions.length > 0 || rule.bowCategories.length > 0) {
      throw new BadRequestException(
        'Cannot delete rule with associated divisions or bow categories',
      );
    }

    await this.em.removeAndFlush(rule);
  }
}
