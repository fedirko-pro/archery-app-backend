import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { startOfDay } from 'date-fns';
import { Tournament } from './tournament.entity';
import { TournamentFeedback } from './tournament-feedback.entity';
import {
  TournamentApplication,
  ApplicationStatus,
} from './tournament-application.entity';
import { Patrol } from './patrol.entity';
import { PatrolMember } from './patrol-member.entity';
import { User } from '../user/entity/user.entity';

export interface FeedbackSummary {
  averageRating: number | null;
  totalCount: number;
}

@Injectable()
export class TournamentFeedbackService {
  constructor(private readonly em: EntityManager) {}

  isFeedbackWindowOpen(tournament: Tournament): boolean {
    const endDate = tournament.endDate ?? tournament.startDate;
    return startOfDay(endDate) < startOfDay(new Date());
  }

  async isEligibleParticipant(
    tournamentId: string,
    userId: string,
  ): Promise<boolean> {
    const patrols = await this.em.find(Patrol, { tournament: tournamentId });

    if (patrols.length > 0) {
      const patrolIds = patrols.map((p) => p.id);
      const member = await this.em.findOne(PatrolMember, {
        patrol: { $in: patrolIds },
        user: userId,
      });
      return member !== null;
    }

    const application = await this.em.findOne(TournamentApplication, {
      tournament: tournamentId,
      applicant: userId,
      status: ApplicationStatus.APPROVED,
    });
    return application !== null;
  }

  async getPendingForUser(userId: string): Promise<Tournament[]> {
    const tournaments = await this.em.find(
      Tournament,
      { collectFeedback: true },
      { orderBy: { endDate: 'DESC', startDate: 'DESC' } },
    );

    const pending: Tournament[] = [];

    for (const tournament of tournaments) {
      if (!this.isFeedbackWindowOpen(tournament)) continue;

      const eligible = await this.isEligibleParticipant(tournament.id, userId);
      if (!eligible) continue;

      const existing = await this.em.findOne(TournamentFeedback, {
        tournament: tournament.id,
        user: userId,
      });
      if (existing) continue;

      pending.push(tournament);
    }

    return pending;
  }

  async submitFeedback(
    userId: string,
    data: { tournamentId: string; rating: number; comment?: string },
  ): Promise<TournamentFeedback> {
    const { tournamentId, rating, comment } = data;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException(
        'Rating must be an integer between 1 and 5',
      );
    }

    const tournament = await this.em.findOne(Tournament, { id: tournamentId });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    if (!tournament.collectFeedback) {
      throw new BadRequestException(
        'This tournament does not collect feedback',
      );
    }

    if (!this.isFeedbackWindowOpen(tournament)) {
      throw new BadRequestException(
        'Feedback is not yet available for this tournament',
      );
    }

    const eligible = await this.isEligibleParticipant(tournamentId, userId);
    if (!eligible) {
      throw new ForbiddenException(
        'You are not eligible to submit feedback for this tournament',
      );
    }

    const existing = await this.em.findOne(TournamentFeedback, {
      tournament: tournamentId,
      user: userId,
    });
    if (existing) {
      throw new ConflictException(
        'You have already submitted feedback for this tournament',
      );
    }

    const feedback = this.em.create(TournamentFeedback, {
      tournament,
      user: this.em.getReference(User, userId),
      rating,
      comment: comment?.trim() || undefined,
      createdAt: new Date(),
    } as any);

    await this.em.persistAndFlush(feedback);
    return feedback;
  }

  async getMyFeedback(
    tournamentId: string,
    userId: string,
  ): Promise<TournamentFeedback | null> {
    return this.em.findOne(
      TournamentFeedback,
      { tournament: tournamentId, user: userId },
      { populate: ['tournament'] },
    );
  }

  async getFeedbackForTournament(tournamentId: string): Promise<{
    summary: FeedbackSummary;
    items: TournamentFeedback[];
  }> {
    const tournament = await this.em.findOne(Tournament, { id: tournamentId });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    const items = await this.em.find(
      TournamentFeedback,
      { tournament: tournamentId },
      {
        populate: ['user'],
        orderBy: { rating: 'DESC', createdAt: 'DESC' },
      },
    );

    const summary = this.computeSummary(items);
    return { summary, items };
  }

  computeSummary(items: TournamentFeedback[]): FeedbackSummary {
    if (items.length === 0) {
      return { averageRating: null, totalCount: 0 };
    }
    const sum = items.reduce((acc, item) => acc + item.rating, 0);
    const averageRating = Math.round((sum / items.length) * 10) / 10;
    return { averageRating, totalCount: items.length };
  }
}
