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
import { Division } from '../division/division.entity';
import { BowCategory } from '../bow-category/bow-category.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class TournamentApplicationService {
  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
  ) {}

  /** Resolve divisionId from division (id) or divisionId. */
  private resolveDivisionId(data: {
    divisionId?: string;
    division?: string;
  }): string | undefined {
    return data.divisionId ?? data.division ?? undefined;
  }

  /** Resolve bowCategoryId from bowCategoryId or category (id or code). */
  private async resolveBowCategoryId(data: {
    bowCategoryId?: string;
    category?: string;
  }): Promise<string | undefined> {
    const raw = data.bowCategoryId ?? data.category;
    if (!raw) return undefined;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        raw,
      );
    if (isUuid) {
      const found = await this.em.findOne(BowCategory, { id: raw });
      if (!found) {
        throw new NotFoundException(`BowCategory with ID ${raw} not found`);
      }
      return found.id;
    }
    const byCode = await this.em.findOne(BowCategory, { code: raw });
    if (!byCode) {
      throw new NotFoundException(`BowCategory with code ${raw} not found`);
    }
    return byCode.id;
  }

  async create(data: {
    tournamentId: string;
    applicantId: string;
    divisionId?: string;
    division?: string;
    bowCategoryId?: string;
    category?: string;
    notes?: string;
  }): Promise<TournamentApplication> {
    const divisionId = this.resolveDivisionId(data);
    const bowCategoryId = await this.resolveBowCategoryId(data);

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

      if (bowCategoryId) {
        const existingApplicationWithSameCategory = existingApplications.find(
          (app) => app.bowCategory?.id === bowCategoryId,
        );

        if (existingApplicationWithSameCategory) {
          throw new ConflictException(
            `Application for this bow category already exists for this tournament`,
          );
        }
      }
    }

    // Load Division and BowCategory if provided
    let division: Division | null = null;
    let bowCategory: BowCategory | null = null;

    if (divisionId) {
      division = await this.em.findOne(Division, { id: divisionId });
      if (!division) {
        throw new NotFoundException(`Division with ID ${divisionId} not found`);
      }
    }

    if (bowCategoryId) {
      bowCategory = await this.em.findOne(BowCategory, {
        id: bowCategoryId,
      });
      if (!bowCategory) {
        throw new NotFoundException(
          `BowCategory with ID ${bowCategoryId} not found`,
        );
      }
    }

    const application = this.em.create(TournamentApplication, {
      tournament,
      applicant,
      division: division || undefined,
      bowCategory: bowCategory || undefined,
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
        populate: ['tournament', 'applicant', 'division', 'bowCategory'],
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
        populate: ['applicant', 'division', 'bowCategory'],
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
    adminUserId?: string,
  ): Promise<TournamentApplication> {
    const application = await this.findById(id);

    // ✅ Status transition validation
    // Prevent changing to the same status
    if (application.status === status) {
      throw new BadRequestException(
        `Application is already ${status}. No change needed.`,
      );
    }

    // Prevent admins from changing withdrawn applications
    // (Users withdrew themselves, respect their decision)
    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException(
        `Cannot change status of a withdrawn application. The applicant withdrew this application themselves.`,
      );
    }

    // Prevent admins from setting status to withdrawn
    // (Only users can withdraw their own applications)
    if (status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException(
        `Cannot set status to withdrawn. Only applicants can withdraw their own applications.`,
      );
    }

    // All other transitions are allowed:
    // - PENDING → APPROVED/REJECTED
    // - APPROVED → REJECTED (admin changed their mind)
    // - REJECTED → APPROVED (admin made a mistake or circumstances changed)

    // Update status
    application.status = status;

    // Handle rejection reason
    if (status === ApplicationStatus.REJECTED) {
      // Set rejection reason if provided
      if (rejectionReason) {
        application.rejectionReason = rejectionReason;
      }
    } else if (status === ApplicationStatus.APPROVED) {
      // Clear rejection reason when approving (even if previously rejected)
      application.rejectionReason = undefined;
    }

    // ✅ Audit trail - track who processed the application
    if (
      adminUserId &&
      (status === ApplicationStatus.APPROVED ||
        status === ApplicationStatus.REJECTED)
    ) {
      const admin = await this.em.findOne(User, { id: adminUserId });
      if (admin) {
        application.processedBy = admin;
        application.processedAt = new Date();
      }
    }

    application.updatedAt = new Date();

    await this.em.persistAndFlush(application);

    // ✅ Send email notification
    try {
      const applicantName = application.applicant.firstName || 'Archer';
      const tournamentTitle = application.tournament.title;

      if (status === ApplicationStatus.APPROVED) {
        await this.emailService.sendApplicationStatusEmail(
          application.applicant.email,
          applicantName,
          tournamentTitle,
          'approved',
        );
      } else if (status === ApplicationStatus.REJECTED) {
        await this.emailService.sendApplicationStatusEmail(
          application.applicant.email,
          applicantName,
          tournamentTitle,
          'rejected',
          rejectionReason,
        );
      }
    } catch (error) {
      // Log error but don't fail the status update
      console.error('Failed to send notification email:', error);
    }

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
