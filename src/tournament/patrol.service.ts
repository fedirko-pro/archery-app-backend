import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Patrol } from './patrol.entity';
import { PatrolMember } from './patrol-member.entity';
import { PatrolRole } from './patrol-member.entity';
import { Tournament } from './tournament.entity';
import {
  TournamentApplication,
  ApplicationStatus,
} from './tournament-application.entity';
import { User } from '../user/entity/user.entity';
import { PatrolGenerationService } from './patrol-generation.service';
import { PatrolPdfService } from './patrol-pdf.service';
import {
  PatrolEntry,
  PatrolGenerationConfig,
  PatrolGenerationResult,
} from './interfaces/patrol-generation.interface';
import { format } from 'date-fns';

@Injectable()
export class PatrolService {
  constructor(
    private readonly em: EntityManager,
    private readonly patrolGenerationService: PatrolGenerationService,
    private readonly patrolPdfService: PatrolPdfService,
  ) {}

  async create(data: Partial<Patrol>): Promise<Patrol> {
    if (!data.name || !data.tournament || !data.leader) {
      throw new BadRequestException(
        'Name, tournament, and leader are required',
      );
    }

    const patrol = this.em.create(Patrol, data as any);
    await this.em.persistAndFlush(patrol);
    return patrol;
  }

  async findAll(): Promise<Patrol[]> {
    return this.em.find(
      Patrol,
      {},
      {
        populate: ['leader', 'members', 'tournament'],
      },
    );
  }

  async findById(id: string): Promise<Patrol> {
    const patrol = await this.em.findOne(
      Patrol,
      { id },
      {
        populate: ['leader', 'members', 'tournament'],
      },
    );

    if (!patrol) {
      throw new NotFoundException('Patrol not found');
    }

    return patrol;
  }

  async findByTournament(tournamentId: string): Promise<Patrol[]> {
    return this.em.find(
      Patrol,
      { tournament: tournamentId },
      {
        populate: ['leader', 'members'],
      },
    );
  }

  async update(id: string, data: Partial<Patrol>): Promise<Patrol> {
    const patrol = await this.findById(id);

    Object.assign(patrol, data);
    patrol.updatedAt = new Date();

    await this.em.persistAndFlush(patrol);
    return patrol;
  }

  async remove(id: string): Promise<void> {
    const patrol = await this.findById(id);
    await this.em.removeAndFlush(patrol);
  }

  async addMember(
    patrolId: string,
    userId: string,
    role: PatrolRole,
  ): Promise<PatrolMember> {
    const member = this.em.create(PatrolMember, {
      patrol: patrolId,
      user: userId,
      role,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(member);
    return member;
  }

  async removeMember(patrolId: string, userId: string): Promise<void> {
    await this.em.nativeDelete(PatrolMember, {
      patrol: patrolId,
      user: userId,
    });
  }

  /**
   * Generate patrols for a tournament based on all approved applications
   */
  async generatePatrolsForTournament(
    tournamentId: string,
  ): Promise<PatrolGenerationResult> {
    // 1. Fetch tournament
    const tournament = await this.em.findOne(Tournament, { id: tournamentId });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    // 2. Fetch ALL approved applications for this tournament (no category filter)
    const applications = await this.em.find(
      TournamentApplication,
      {
        tournament: { id: tournamentId },
        status: ApplicationStatus.APPROVED,
      },
      {
        populate: ['applicant', 'applicant.club', 'division', 'bowCategory'],
      },
    );

    if (applications.length === 0) {
      throw new BadRequestException(
        'No approved applications found for this tournament',
      );
    }

    // 3. Transform applications to PatrolEntry format
    const entries: PatrolEntry[] = applications.map((app) => {
      const user = app.applicant;
      return {
        participantId: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        club: user.club?.name || 'No Club',
        bowCategory: app.bowCategory?.name || 'Unknown',
        division: app.division?.name || 'Unknown',
        gender: user.gender || 'Other',
        escalao: app.division?.name || 'Unknown',
      };
    });

    // 4. Configure generation (use targetCount from tournament)
    const config: PatrolGenerationConfig = {
      tournamentId,
      bowCategory: 'All Categories', // No filtering by category
      targetPatrolCount: tournament.targetCount,
      minPatrolSize: 3,
      groupingPriority: [
        { field: 'division', weight: 5 },
        { field: 'gender', weight: 2 },
      ],
    };

    // 5. Generate patrols using the algorithm
    const result = this.patrolGenerationService.generatePatrols(
      entries,
      config,
    );

    return result;
  }

  /**
   * Save generated patrols to database
   */
  async saveGeneratedPatrols(
    tournamentId: string,
    generatedPatrols: PatrolGenerationResult,
  ): Promise<Patrol[]> {
    const tournament = await this.em.findOne(Tournament, { id: tournamentId });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    const savedPatrols: Patrol[] = [];

    for (const generatedPatrol of generatedPatrols.patrols) {
      // Find leader and members
      const leader = await this.em.findOne(User, {
        id: generatedPatrol.leaderId,
      });
      if (!leader) {
        throw new NotFoundException(
          `Leader with ID ${generatedPatrol.leaderId} not found`,
        );
      }

      // Create patrol
      const patrol = this.em.create(Patrol, {
        name: `Target ${generatedPatrol.targetNumber}`,
        description: `Patrol for target ${generatedPatrol.targetNumber}`,
        tournament,
        leader,
        createdAt: new Date(),
      });

      await this.em.persistAndFlush(patrol);

      // Add members
      for (const memberId of generatedPatrol.members) {
        const isJudge = generatedPatrol.judgeIds.includes(memberId);
        const isLeader = memberId === generatedPatrol.leaderId;

        let role: PatrolRole = PatrolRole.MEMBER;
        if (isLeader) {
          role = PatrolRole.LEADER;
        } else if (isJudge) {
          role = PatrolRole.JUDGE;
        }

        await this.addMember(patrol.id, memberId, role);
      }

      savedPatrols.push(patrol);
    }

    return savedPatrols;
  }

  /**
   * Generate PDF for saved patrols of a tournament
   */
  async generatePatrolPdf(tournamentId: string): Promise<Buffer> {
    // 1. Fetch tournament info
    const tournament = await this.em.findOne(Tournament, { id: tournamentId });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    // 2. Fetch all patrols for this tournament
    const patrols = await this.em.find(
      Patrol,
      { tournament: { id: tournamentId } },
      {
        populate: ['leader', 'leader.club'],
      },
    );

    if (patrols.length === 0) {
      throw new BadRequestException('No patrols found for this tournament');
    }

    // 3. Get all patrol members
    const allPatrolMembers = await this.em.find(
      PatrolMember,
      { patrol: { $in: patrols.map((p) => p.id) } },
      { populate: ['user', 'user.club'] },
    );

    // 4. Transform to GeneratedPatrol format for PDF
    const generatedPatrols = patrols.map((patrol) => {
      // Get members for this patrol
      const members = allPatrolMembers.filter((m) => {
        const patrolId =
          typeof m.patrol === 'string' ? m.patrol : (m.patrol as any).id;
        return patrolId === patrol.id;
      });

      const judges = members
        .filter((m) => m.role === PatrolRole.JUDGE)
        .map((m) => m.user.id)
        .slice(0, 2) as [string, string];

      // Extract target number from patrol name (e.g., "Target 1" -> 1)
      const targetMatch = patrol.name.match(/\d+/);
      const targetNumber = targetMatch
        ? parseInt(targetMatch[0], 10)
        : patrols.indexOf(patrol) + 1;

      return {
        id: patrol.id,
        targetNumber,
        members: members.map((m) => m.user.id),
        leaderId: patrol.leader.id,
        judgeIds:
          judges.length === 2
            ? judges
            : ([members[0]?.user.id || '', members[1]?.user.id || ''] as [
                string,
                string,
              ]),
      };
    });

    // 5. Build entries map from all members
    const allMemberIds = new Set<string>();
    allPatrolMembers.forEach((member) => {
      allMemberIds.add(member.user.id);
    });

    const users = await this.em.find(
      User,
      { id: { $in: Array.from(allMemberIds) } },
      { populate: ['club'] },
    );

    // 6. Get applications to find division and bow category info
    const applications = await this.em.find(
      TournamentApplication,
      {
        tournament: { id: tournamentId },
        applicant: { id: { $in: Array.from(allMemberIds) } },
        status: ApplicationStatus.APPROVED,
      },
      { populate: ['division', 'bowCategory'] },
    );

    const entries: PatrolEntry[] = users.map((user) => {
      const app = applications.find((a) => a.applicant.id === user.id);
      return {
        participantId: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        club: user.club?.name || 'No Club',
        bowCategory: app?.bowCategory?.name || 'Unknown',
        division: app?.division?.name || 'Unknown',
        gender: user.gender || 'Other',
        escalao: app?.division?.name || 'Unknown',
      };
    });

    // 7. Get bow category name (from first patrol's members)
    const firstApp = applications[0];
    const bowCategoryName = firstApp?.bowCategory?.name || 'All Categories';

    // 8. Generate PDF
    const pdfBuffer = await this.patrolPdfService.generatePatrolListPdf(
      tournament.title,
      bowCategoryName,
      format(tournament.startDate, 'dd/MM/yyyy'),
      generatedPatrols,
      entries,
    );

    return pdfBuffer;
  }
}
