import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  TournamentApplication,
  ApplicationStatus,
} from './tournament-application.entity';
import { Tournament } from './tournament.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class TournamentApplicationService {
  constructor(private readonly em: EntityManager) {}

  async create(data: {
    tournamentId: string;
    applicantId: string;
    category?: string;
    division?: string;
    equipment?: string;
    notes?: string;
  }): Promise<TournamentApplication> {
    const tournament = await this.em.findOne(Tournament, {
      id: data.tournamentId,
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const applicant = await this.em.findOne(User, { id: data.applicantId });
    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    const existingApplications = await this.em.find(TournamentApplication, {
      tournament: { id: data.tournamentId },
      applicant: { id: data.applicantId },
    });

    if (existingApplications.length > 0) {
      if (!tournament.allowMultipleApplications) {
        throw new ConflictException(
          'Application already exists for this tournament',
        );
      }

      if (data.category) {
        const existingApplicationWithSameCategory = existingApplications.find(
          (app) => app.category === data.category,
        );

        if (existingApplicationWithSameCategory) {
          throw new ConflictException(
            `Application for category '${data.category}' already exists for this tournament`,
          );
        }
      }
    }

    const application = this.em.create(TournamentApplication, {
      tournament,
      applicant,
      category: data.category,
      division: data.division,
      equipment: data.equipment,
      notes: data.notes,
      status: ApplicationStatus.PENDING,
      createdAt: new Date(),
    });

    await this.em.persistAndFlush(application);
    return application;
  }

  async findAll(): Promise<TournamentApplication[]> {
    return this.em.find(
      TournamentApplication,
      {},
      {
        populate: ['tournament', 'applicant'],
      },
    );
  }

  async findByTournament(
    tournamentId: string,
  ): Promise<TournamentApplication[]> {
    return this.em.find(
      TournamentApplication,
      {
        tournament: { id: tournamentId },
      },
      {
        populate: ['applicant'],
      },
    );
  }

  async findByApplicant(applicantId: string): Promise<TournamentApplication[]> {
    return this.em.find(
      TournamentApplication,
      {
        applicant: { id: applicantId },
      },
      {
        populate: ['tournament'],
      },
    );
  }

  async findById(id: string): Promise<TournamentApplication> {
    const application = await this.em.findOne(
      TournamentApplication,
      { id },
      {
        populate: ['tournament', 'applicant'],
      },
    );

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    rejectionReason?: string,
  ): Promise<TournamentApplication> {
    const application = await this.findById(id);

    application.status = status;
    if (status === ApplicationStatus.REJECTED && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    application.updatedAt = new Date();

    await this.em.persistAndFlush(application);
    return application;
  }

  async withdraw(
    id: string,
    applicantId: string,
  ): Promise<TournamentApplication> {
    const application = await this.findById(id);

    // Перевіряємо чи заявка належить користувачу
    if (application.applicant.id !== applicantId) {
      throw new BadRequestException(
        'You can only withdraw your own applications',
      );
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Can only withdraw pending applications');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    application.updatedAt = new Date();

    await this.em.persistAndFlush(application);
    return application;
  }

  async remove(id: string): Promise<void> {
    const application = await this.findById(id);
    await this.em.removeAndFlush(application);
  }

  async getApplicationStats(tournamentId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    withdrawn: number;
  }> {
    const applications = await this.findByTournament(tournamentId);

    return {
      total: applications.length,
      pending: applications.filter(
        (app) => app.status === ApplicationStatus.PENDING,
      ).length,
      approved: applications.filter(
        (app) => app.status === ApplicationStatus.APPROVED,
      ).length,
      rejected: applications.filter(
        (app) => app.status === ApplicationStatus.REJECTED,
      ).length,
      withdrawn: applications.filter(
        (app) => app.status === ApplicationStatus.WITHDRAWN,
      ).length,
    };
  }
}
