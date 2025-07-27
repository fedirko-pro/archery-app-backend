import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Tournament } from './tournament.entity';
import { subDays, parseISO } from 'date-fns';

@Injectable()
export class TournamentService {
  constructor(private readonly em: EntityManager) {}

  async create(data: Partial<Tournament>): Promise<Tournament> {
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

    const tournament = this.em.create(Tournament, {
      ...data,
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
        populate: ['createdBy', 'patrols'],
      },
    );
  }

  async findById(id: string): Promise<Tournament> {
    const tournament = await this.em.findOne(
      Tournament,
      { id },
      {
        populate: ['createdBy', 'patrols'],
      },
    );

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async update(id: string, data: Partial<Tournament>): Promise<Tournament> {
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

    Object.assign(tournament, data);
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

    await this.em.removeAndFlush(tournament);
  }
}
