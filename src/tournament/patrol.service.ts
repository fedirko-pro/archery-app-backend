import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
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
  ScoreCardConfig,
} from './interfaces/patrol-generation.interface';
import { format } from 'date-fns';

@Injectable()
export class PatrolService {
  private readonly logger = new Logger(PatrolService.name);

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

  async findAll(): Promise<any[]> {
    const patrols = await this.em.find(
      Patrol,
      {},
      {
        populate: ['leader', 'leader.club', 'tournament'],
      },
    );

    // Get all patrol members separately to avoid circular references
    const allMembers = await this.em.find(
      PatrolMember,
      { patrol: { $in: patrols.map((p) => p.id) } },
      { populate: ['user', 'user.club'] },
    );

    return patrols.map((patrol) => {
      const members = allMembers
        .filter((m) => {
          const patrolId =
            typeof m.patrol === 'string' ? m.patrol : m.patrol.id;
          return patrolId === patrol.id;
        })
        .map((m) => ({
          id: m.id,
          role: m.role,
          user: {
            id: m.user.id,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            email: m.user.email,
            gender: m.user.gender || 'Other',
            club: m.user.club
              ? { id: m.user.club.id, name: m.user.club.name }
              : null,
          },
        }));

      return {
        id: patrol.id,
        name: patrol.name,
        description: patrol.description,
        tournament: {
          id: patrol.tournament.id,
          title: patrol.tournament.title,
        },
        leader: {
          id: patrol.leader.id,
          firstName: patrol.leader.firstName,
          lastName: patrol.leader.lastName,
          email: patrol.leader.email,
          gender: patrol.leader.gender || 'Other',
          club: patrol.leader.club
            ? { id: patrol.leader.club.id, name: patrol.leader.club.name }
            : null,
        },
        members,
        createdAt: patrol.createdAt,
        updatedAt: patrol.updatedAt,
      };
    });
  }

  async findById(id: string): Promise<any> {
    const patrol = await this.em.findOne(
      Patrol,
      { id },
      {
        populate: ['leader', 'leader.club', 'tournament'],
      },
    );

    if (!patrol) {
      throw new NotFoundException('Patrol not found');
    }

    // Get members separately
    const members = await this.em.find(
      PatrolMember,
      { patrol: { id } },
      { populate: ['user', 'user.club'] },
    );

    return {
      id: patrol.id,
      name: patrol.name,
      description: patrol.description,
      tournament: {
        id: patrol.tournament.id,
        title: patrol.tournament.title,
      },
      leader: {
        id: patrol.leader.id,
        firstName: patrol.leader.firstName,
        lastName: patrol.leader.lastName,
        email: patrol.leader.email,
        gender: patrol.leader.gender || 'Other',
        club: patrol.leader.club
          ? { id: patrol.leader.club.id, name: patrol.leader.club.name }
          : null,
      },
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        user: {
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          email: m.user.email,
          gender: m.user.gender || 'Other',
          club: m.user.club
            ? { id: m.user.club.id, name: m.user.club.name }
            : null,
        },
      })),
      createdAt: patrol.createdAt,
      updatedAt: patrol.updatedAt,
    };
  }

  async findByTournament(tournamentId: string): Promise<any[]> {
    const patrols = await this.em.find(
      Patrol,
      { tournament: tournamentId },
      {
        populate: ['leader', 'leader.club', 'tournament'],
      },
    );

    // Get all patrol members separately
    const allMembers = await this.em.find(
      PatrolMember,
      { patrol: { $in: patrols.map((p) => p.id) } },
      { populate: ['user', 'user.club'] },
    );

    // Get all user IDs from patrol members
    const allUserIds = new Set<string>();
    allMembers.forEach((m) => allUserIds.add(m.user.id));
    patrols.forEach((p) => allUserIds.add(p.leader.id));

    // Fetch applications to get division and bow category info for each user
    const applications = await this.em.find(
      TournamentApplication,
      {
        tournament: { id: tournamentId },
        applicant: { id: { $in: Array.from(allUserIds) } },
        status: ApplicationStatus.APPROVED,
      },
      { populate: ['division', 'bowCategory', 'applicant'] },
    );

    // Build maps of userId -> division name and userId -> bow category
    const userDivisionMap = new Map<string, string>();
    const userBowCategoryMap = new Map<string, string>();
    applications.forEach((app) => {
      userDivisionMap.set(app.applicant.id, app.division?.name || 'Unknown');
      userBowCategoryMap.set(
        app.applicant.id,
        app.bowCategory?.code || app.bowCategory?.name || 'Unknown',
      );
    });

    return patrols.map((patrol) => {
      const members = allMembers
        .filter((m) => {
          const patrolId =
            typeof m.patrol === 'string' ? m.patrol : m.patrol.id;
          return patrolId === patrol.id;
        })
        .map((m) => ({
          id: m.id,
          role: m.role,
          user: {
            id: m.user.id,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            email: m.user.email,
            gender: m.user.gender || 'Other',
            division: userDivisionMap.get(m.user.id) || 'Unknown',
            bowCategory: userBowCategoryMap.get(m.user.id) || 'Unknown',
            club: m.user.club
              ? { id: m.user.club.id, name: m.user.club.name }
              : null,
          },
        }));

      return {
        id: patrol.id,
        name: patrol.name,
        description: patrol.description,
        tournament: {
          id: patrol.tournament.id,
          title: patrol.tournament.title,
        },
        leader: {
          id: patrol.leader.id,
          firstName: patrol.leader.firstName,
          lastName: patrol.leader.lastName,
          email: patrol.leader.email,
          gender: patrol.leader.gender || 'Other',
          division: userDivisionMap.get(patrol.leader.id) || 'Unknown',
          bowCategory: userBowCategoryMap.get(patrol.leader.id) || 'Unknown',
          club: patrol.leader.club
            ? { id: patrol.leader.club.id, name: patrol.leader.club.name }
            : null,
        },
        members,
        createdAt: patrol.createdAt,
        updatedAt: patrol.updatedAt,
      };
    });
  }

  async update(id: string, data: Partial<Patrol>): Promise<any> {
    const patrolEntity = await this.em.findOne(Patrol, { id });
    if (!patrolEntity) {
      throw new NotFoundException('Patrol not found');
    }

    Object.assign(patrolEntity, data);
    patrolEntity.updatedAt = new Date();

    await this.em.persistAndFlush(patrolEntity);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const patrolEntity = await this.em.findOne(Patrol, { id });
    if (!patrolEntity) {
      throw new NotFoundException('Patrol not found');
    }

    // Delete patrol members first
    await this.em.nativeDelete(PatrolMember, { patrol: id });
    // Delete the patrol
    await this.em.removeAndFlush(patrolEntity);
  }

  /**
   * Delete a patrol and redistribute its members into the remaining patrols of the same tournament.
   * Distributes to the smallest patrols first to balance sizes. Renumbers patrols so there are no gaps.
   * Returns the updated list of patrols for the tournament.
   */
  async deletePatrolAndRedistribute(patrolId: string): Promise<any[]> {
    const patrol = await this.em.findOne(
      Patrol,
      { id: patrolId },
      {
        populate: ['tournament'],
      },
    );
    if (!patrol) {
      throw new NotFoundException('Patrol not found');
    }

    const tournamentId =
      typeof patrol.tournament === 'string'
        ? patrol.tournament
        : patrol.tournament.id;

    const membersToRedistribute = await this.em.find(
      PatrolMember,
      { patrol: { id: patrolId } },
      { fields: ['user'] },
    );
    const userIdsToRedistribute = [
      ...new Set(
        membersToRedistribute.map((m) =>
          typeof m.user === 'string' ? m.user : m.user.id,
        ),
      ),
    ];

    const extractTargetNumber = (name: string): number => {
      const match = /\d+/.exec(name);
      return match ? Number.parseInt(match[0], 10) : 0;
    };

    const remainingPatrols = await this.em.find(Patrol, {
      tournament: tournamentId,
      id: { $ne: patrolId },
    });
    remainingPatrols.sort(
      (a, b) => extractTargetNumber(a.name) - extractTargetNumber(b.name),
    );

    if (remainingPatrols.length === 0) {
      throw new BadRequestException(
        'Cannot delete the only patrol. There are no other patrols to redistribute members to.',
      );
    }

    const memberCountByPatrolId = new Map<string, number>();
    for (const p of remainingPatrols) {
      const count = await this.em.count(PatrolMember, { patrol: { id: p.id } });
      memberCountByPatrolId.set(p.id, count);
    }

    await this.remove(patrolId);

    for (const userId of userIdsToRedistribute) {
      let minPatrolId = remainingPatrols[0].id;
      let minCount = memberCountByPatrolId.get(minPatrolId) ?? 0;
      for (const p of remainingPatrols) {
        const c = memberCountByPatrolId.get(p.id) ?? 0;
        if (c < minCount) {
          minCount = c;
          minPatrolId = p.id;
        }
      }
      await this.addMember(minPatrolId, userId, PatrolRole.MEMBER);
      memberCountByPatrolId.set(minPatrolId, minCount + 1);
    }

    // Renumber remaining patrols so there are no gaps (Target 1, Target 2, ...)
    const patrolsToRenumber = await this.em.find(Patrol, {
      tournament: tournamentId,
    });
    patrolsToRenumber.sort(
      (a, b) => extractTargetNumber(a.name) - extractTargetNumber(b.name),
    );
    for (let i = 0; i < patrolsToRenumber.length; i++) {
      const n = i + 1;
      patrolsToRenumber[i].name = `Target ${n}`;
      patrolsToRenumber[i].description = `Patrol for target ${n}`;
      patrolsToRenumber[i].updatedAt = new Date();
    }
    await this.em.flush();

    return this.findByTournament(tournamentId);
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

    // 3. Validate and transform applications to PatrolEntry format
    const invalidApplications: string[] = [];
    const entries: PatrolEntry[] = [];

    for (const app of applications) {
      if (!app.bowCategory) {
        invalidApplications.push(`Application ${app.id}: Missing bow category`);
        this.logger.warn(
          `Application ${app.id} (user: ${app.applicant.email}) is missing bow category`,
        );
        continue;
      }
      if (!app.division) {
        invalidApplications.push(`Application ${app.id}: Missing division`);
        this.logger.warn(
          `Application ${app.id} (user: ${app.applicant.email}) is missing division`,
        );
        continue;
      }

      const user = app.applicant;
      const gender = user.gender?.toLowerCase() || 'other';
      const normalizedGender: 'm' | 'f' | 'other' = [
        'm',
        'f',
        'other',
      ].includes(gender)
        ? (gender as 'm' | 'f' | 'other')
        : 'other';

      entries.push({
        participantId: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        club: user.club?.name || 'No Club',
        clubShortCode: user.club?.shortCode ?? undefined,
        bowCategory: app.bowCategory.code, // Use code, not name
        division: app.division.name,
        gender: normalizedGender,
        escalao: app.division.name,
      });
    }

    // Log validation results
    if (invalidApplications.length > 0) {
      this.logger.warn(
        `Skipped ${invalidApplications.length} invalid applications: ${invalidApplications.join(', ')}`,
      );
    }

    if (entries.length === 0) {
      throw new BadRequestException(
        'No valid applications found. All applications are missing required fields (bow category or division).',
      );
    }

    if (entries.length < tournament.targetCount * 3) {
      this.logger.warn(
        `Low participant count (${entries.length}) for ${tournament.targetCount} targets. Minimum recommended: ${tournament.targetCount * 3}`,
      );
    }

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
    try {
      const result = this.patrolGenerationService.generatePatrols(
        entries,
        config,
      );

      this.logger.log(
        `Successfully generated ${result.patrols.length} patrols for tournament ${tournamentId}`,
      );
      this.logger.debug(
        `Patrol generation stats: ${JSON.stringify(result.stats)}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to generate patrols for tournament ${tournamentId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to generate patrols: ${error.message}`,
      );
    }
  }

  /**
   * Save generated patrols to database
   */
  async saveGeneratedPatrols(
    tournamentId: string,
    generatedPatrols: PatrolGenerationResult,
  ): Promise<any[]> {
    const tournament = await this.em.findOne(Tournament, { id: tournamentId });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    const savedPatrolIds: string[] = [];

    for (const generatedPatrol of generatedPatrols.patrols) {
      // Find leader and members
      const leader = await this.em.findOne(
        User,
        {
          id: generatedPatrol.leaderId,
        },
        { populate: ['club'] },
      );
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

      savedPatrolIds.push(patrol.id);
    }

    // Fetch and return saved patrols as plain objects
    return this.findByTournament(tournamentId);
  }

  /**
   * Generate PDF for saved patrols of a tournament
   */
  async generatePatrolPdf(tournamentId: string): Promise<{
    buffer: Buffer;
    tournamentTitle: string;
    startDate: Date;
  }> {
    // 1. Fetch tournament info with rule
    const tournament = await this.em.findOne(
      Tournament,
      { id: tournamentId },
      {
        populate: ['rule'],
      },
    );
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
      const gender = user.gender?.toLowerCase() || 'other';
      const normalizedGender: 'm' | 'f' | 'other' = [
        'm',
        'f',
        'other',
      ].includes(gender)
        ? (gender as 'm' | 'f' | 'other')
        : 'other';

      return {
        participantId: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        club: user.club?.name || 'No Club',
        clubShortCode: user.club?.shortCode ?? undefined,
        bowCategory: app?.bowCategory?.code || app?.bowCategory?.name || '-',
        division: app?.division?.name || '-',
        gender: normalizedGender,
        escalao: app?.division?.name || '-',
      };
    });

    const rulesLabel = tournament.rule!.ruleName;
    const location = tournament.address || '';

    // 8. Generate PDF
    const pdfBuffer = await this.patrolPdfService.generatePatrolListPdf(
      tournament.title,
      rulesLabel,
      location,
      format(tournament.startDate, 'dd/MM/yyyy'),
      generatedPatrols,
      entries,
    );

    return {
      buffer: pdfBuffer,
      tournamentTitle: tournament.title,
      startDate: tournament.startDate,
    };
  }

  /**
   * Generate PDF with score cards for all patrol members
   */
  async generateScoreCardsPdf(tournamentId: string): Promise<{
    buffer: Buffer;
    tournamentTitle: string;
    startDate: Date;
  }> {
    // Reuse same data fetching as patrol list PDF
    const tournament = await this.em.findOne(Tournament, { id: tournamentId });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID ${tournamentId} not found`,
      );
    }

    const patrols = await this.em.find(
      Patrol,
      { tournament: { id: tournamentId } },
      { populate: ['leader', 'leader.club'] },
    );

    if (patrols.length === 0) {
      throw new BadRequestException('No patrols found for this tournament');
    }

    const allPatrolMembers = await this.em.find(
      PatrolMember,
      { patrol: { $in: patrols.map((p) => p.id) } },
      { populate: ['user', 'user.club'] },
    );

    const generatedPatrols = patrols.map((patrol) => {
      const members = allPatrolMembers.filter((m) => {
        const patrolId =
          typeof m.patrol === 'string' ? m.patrol : (m.patrol as any).id;
        return patrolId === patrol.id;
      });

      const judges = members
        .filter((m) => m.role === PatrolRole.JUDGE)
        .map((m) => m.user.id)
        .slice(0, 2) as [string, string];

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

    const allMemberIds = new Set<string>();
    allPatrolMembers.forEach((member) => allMemberIds.add(member.user.id));

    const applications = await this.em.find(
      TournamentApplication,
      {
        tournament: { id: tournamentId },
        applicant: { id: { $in: Array.from(allMemberIds) } },
        status: ApplicationStatus.APPROVED,
      },
      { populate: ['division', 'bowCategory'] },
    );

    const entries: PatrolEntry[] = Array.from(allMemberIds).map((userId) => {
      const member = allPatrolMembers.find((m) => m.user.id === userId)!;
      const app = applications.find((a) => a.applicant.id === userId);
      const user = member.user;
      const gender = user.gender?.toLowerCase() || 'other';
      const normalizedGender: 'm' | 'f' | 'other' = [
        'm',
        'f',
        'other',
      ].includes(gender)
        ? (gender as 'm' | 'f' | 'other')
        : 'other';

      return {
        participantId: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        club: user.club?.name || 'No Club',
        clubShortCode: user.club?.shortCode ?? undefined,
        bowCategory: app?.bowCategory?.code || app?.bowCategory?.name || '-',
        division: app?.division?.name || '-',
        gender: normalizedGender,
        escalao: app?.division?.name || '-',
        federationNumber: user.federationNumber ?? undefined,
      };
    });

    const scoreConfig: ScoreCardConfig = {
      arrowsPerEnd: 5,
      endsCount: 20,
    };

    const pdfBuffer = await this.patrolPdfService.generateScoreCardsPdf(
      tournament.title,
      tournament.address || '',
      format(tournament.startDate, 'dd/MM/yyyy'),
      generatedPatrols,
      entries,
      scoreConfig,
    );

    return {
      buffer: pdfBuffer,
      tournamentTitle: tournament.title,
      startDate: tournament.startDate,
    };
  }
}
