import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Tournament } from './tournament.entity';
import { Rule } from '../rule/rule.entity';
import { subDays, parseISO } from 'date-fns';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class TournamentService {
  constructor(
    private readonly em: EntityManager,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    data: Partial<Tournament> & { ruleCode?: string; ruleId?: string },
  ): Promise<Tournament> {
    if (!data.title || !data.startDate || !data.createdBy) {
      throw new BadRequestException(
        'Title, startDate, and createdBy are required',
      );
    }

    const startDate =
      typeof data.startDate === 'string'
        ? parseISO(data.startDate)
        : data.startDate;

    const endDate = data.endDate
      ? typeof data.endDate === 'string'
        ? parseISO(data.endDate)
        : data.endDate
      : startDate;

    const applicationDeadline = data.applicationDeadline
      ? typeof data.applicationDeadline === 'string'
        ? parseISO(data.applicationDeadline)
        : data.applicationDeadline
      : subDays(startDate, 5);

    // Handle rule assignment
    let rule: Rule | null = null;
    if (data.ruleId) {
      rule = await this.em.findOne(Rule, { id: data.ruleId });
      if (!rule) {
        throw new NotFoundException(`Rule with ID ${data.ruleId} not found`);
      }
    } else if (data.ruleCode) {
      rule = await this.em.findOne(Rule, { ruleCode: data.ruleCode });
      if (!rule) {
        throw new NotFoundException(
          `Rule with code ${data.ruleCode} not found`,
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ruleCode: _ruleCode, ruleId: _ruleId, ...tournamentData } = data;

    const tournament = this.em.create(Tournament, {
      ...tournamentData,
      rule,
      startDate,
      endDate,
      applicationDeadline,
      allowMultipleApplications: data.allowMultipleApplications ?? true,
    } as any);

    await this.em.persistAndFlush(tournament);
    return tournament;
  }

  async findAll(): Promise<Tournament[]> {
    return this.em.find(
      Tournament,
      {},
      {
        populate: ['createdBy', 'rule'],
        orderBy: { startDate: 'ASC' }, // Sort by start date, nearest first
      },
    );
  }

  async findById(id: string): Promise<Tournament> {
    const tournament = await this.em.findOne(
      Tournament,
      { id },
      {
        populate: ['createdBy', 'rule'],
      },
    );

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async update(
    id: string,
    data: Partial<Tournament> & { ruleCode?: string; ruleId?: string },
  ): Promise<Tournament> {
    const tournament = await this.findById(id);

    if (data.startDate) {
      const startDate =
        typeof data.startDate === 'string'
          ? parseISO(data.startDate)
          : data.startDate;

      if (!data.endDate || data.endDate === data.startDate) {
        data.endDate = startDate;
      }

      if (!data.applicationDeadline) {
        data.applicationDeadline = subDays(startDate, 5);
      }
    }

    // Handle rule assignment
    if (data.ruleId !== undefined || data.ruleCode !== undefined) {
      let rule: Rule | undefined = undefined;
      if (data.ruleId) {
        const foundRule = await this.em.findOne(Rule, { id: data.ruleId });
        if (!foundRule) {
          throw new NotFoundException(`Rule with ID ${data.ruleId} not found`);
        }
        rule = foundRule;
      } else if (data.ruleCode) {
        const foundRule = await this.em.findOne(Rule, {
          ruleCode: data.ruleCode,
        });
        if (!foundRule) {
          throw new NotFoundException(
            `Rule with code ${data.ruleCode} not found`,
          );
        }
        rule = foundRule;
      }
      tournament.rule = rule;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ruleCode: _rc, ruleId: _ri, ...updateData } = data;
    Object.assign(tournament, updateData);
    tournament.updatedAt = new Date();

    await this.em.persistAndFlush(tournament);
    return tournament;
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.findById(id);

    const applicationsCount = await this.em.count('TournamentApplication', {
      tournament: { id },
    });

    if (applicationsCount > 0) {
      throw new BadRequestException(
        `Cannot delete tournament with ${applicationsCount} applications. Please delete applications first.`,
      );
    }

    // Clean up all tournament files (banner and attachments) before deleting
    await this.uploadService.cleanupTournamentFiles(id);

    await this.em.removeAndFlush(tournament);
  }
}
