import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TrainingSession } from './training-session.entity';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import {
  TrainingStatsDto,
  ShotPeriodStatsDto,
  MetersPeriodStatsDto,
  ApplicationStatsForUserDto,
  MonthlyDataPointDto,
} from './dto/training-stats.dto';
import { User } from '../user/entity/user.entity';
import {
  TournamentApplication,
  ApplicationStatus,
} from '../tournament/tournament-application.entity';

@Injectable()
export class TrainingService {
  constructor(private readonly em: EntityManager) {}

  async create(
    userId: string,
    createDto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    const user = this.em.getReference(User, userId);
    const session = new TrainingSession();
    Object.assign(session, createDto);
    session.user = user;

    await this.em.persistAndFlush(session);
    return session;
  }

  async findAllForUser(userId: string): Promise<TrainingSession[]> {
    return this.em.find(
      TrainingSession,
      { user: { id: userId } },
      { orderBy: { date: 'DESC' } },
    );
  }

  async findOne(id: string, userId: string): Promise<TrainingSession> {
    const session = await this.em.findOne(TrainingSession, { id });

    if (!session) {
      throw new NotFoundException(`Training session with ID ${id} not found`);
    }

    await this.em.populate(session, ['user']);

    if ((session.user as User).id !== userId) {
      throw new ForbiddenException();
    }

    return session;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    const session = await this.findOne(id, userId);
    Object.assign(session, updateDto);
    await this.em.flush();
    return session;
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.findOne(id, userId);
    await this.em.removeAndFlush(session);
  }

  async bulkSync(
    userId: string,
    sessions: CreateTrainingSessionDto[],
  ): Promise<TrainingSession[]> {
    const user = this.em.getReference(User, userId);
    const created: TrainingSession[] = [];

    for (const dto of sessions) {
      const session = new TrainingSession();
      Object.assign(session, dto);
      session.user = user;
      this.em.persist(session);
      created.push(session);
    }

    await this.em.flush();
    return created;
  }

  async getStats(userId: string): Promise<TrainingStatsDto> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sessions = await this.em.find(
      TrainingSession,
      { user: { id: userId } },
      { orderBy: { date: 'ASC' } },
    );

    const applications = await this.em.find(TournamentApplication, {
      applicant: { id: userId },
    });

    const { shots, metersTraveled, distanceCount, targetTypeCount } =
      aggregateSessions(sessions);

    const tournamentApplications = aggregateApplications(applications);

    return {
      registrationDate: (user.createdAt ?? new Date()).toISOString(),
      totalSessions: sessions.length,
      currentStreakWeeks: calculateStreakWeeks(sessions),
      shots,
      metersTraveled,
      avgShotsPerSession:
        sessions.length > 0 ? Math.round(shots.total / sessions.length) : 0,
      mostUsedDistance: getMostFrequent(distanceCount),
      mostUsedTargetType: getMostFrequent(targetTypeCount),
      shotsByMonth: buildLast12MonthsData(sessions, 'shots'),
      sessionsByMonth: buildLast12MonthsData(sessions, 'sessions'),
      tournamentApplications,
    };
  }
}

function aggregateSessions(sessions: TrainingSession[]): {
  shots: ShotPeriodStatsDto;
  metersTraveled: MetersPeriodStatsDto;
  distanceCount: Record<string, number>;
  targetTypeCount: Record<string, number>;
} {
  const now = new Date();
  const startOfThisWeek = getStartOfWeek(now);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfThisYear = new Date(now.getFullYear(), 0, 1);

  let totalShots = 0;
  let shotsThisWeek = 0;
  let shotsThisMonth = 0;
  let shotsThisYear = 0;
  let totalMeters = 0;
  let metersThisMonth = 0;
  let metersThisYear = 0;
  const distanceCount: Record<string, number> = {};
  const targetTypeCount: Record<string, number> = {};

  for (const session of sessions) {
    const sessionDate = new Date(session.date + 'T00:00:00');
    const shots = session.shotsCount ?? 0;
    const distanceNum = session.distance
      ? Number.parseFloat(session.distance)
      : 0;
    const meters =
      !Number.isNaN(distanceNum) && distanceNum > 0
        ? shots * distanceNum * 2
        : 0;

    totalShots += shots;
    totalMeters += meters;

    if (sessionDate >= startOfThisWeek) shotsThisWeek += shots;
    if (sessionDate >= startOfThisMonth) {
      shotsThisMonth += shots;
      metersThisMonth += meters;
    }
    if (sessionDate >= startOfThisYear) {
      shotsThisYear += shots;
      metersThisYear += meters;
    }

    incrementCount(distanceCount, session.distance);
    incrementCount(targetTypeCount, session.targetType);
  }

  return {
    shots: {
      total: totalShots,
      thisWeek: shotsThisWeek,
      thisMonth: shotsThisMonth,
      thisYear: shotsThisYear,
    },
    metersTraveled: {
      total: Math.round(totalMeters),
      thisMonth: Math.round(metersThisMonth),
      thisYear: Math.round(metersThisYear),
    },
    distanceCount,
    targetTypeCount,
  };
}

function aggregateApplications(
  applications: TournamentApplication[],
): ApplicationStatsForUserDto {
  return {
    total: applications.length,
    approved: applications.filter(
      (a) => a.status === ApplicationStatus.APPROVED,
    ).length,
    pending: applications.filter((a) => a.status === ApplicationStatus.PENDING)
      .length,
    rejected: applications.filter(
      (a) => a.status === ApplicationStatus.REJECTED,
    ).length,
    withdrawn: applications.filter(
      (a) => a.status === ApplicationStatus.WITHDRAWN,
    ).length,
  };
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function incrementCount(map: Record<string, number>, key?: string): void {
  if (key) map[key] = (map[key] ?? 0) + 1;
}

function getMostFrequent(countMap: Record<string, number>): string | null {
  const entries = Object.entries(countMap);
  if (entries.length === 0) return null;
  const sorted = [...entries].sort(
    ([, a]: [string, number], [, b]: [string, number]) => b - a,
  );
  return sorted[0][0];
}

function getIsoWeekString(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86_400_000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${d.getFullYear()}-${weekNum.toString().padStart(2, '0')}`;
}

function calculateStreakWeeks(sessions: TrainingSession[]): number {
  if (sessions.length === 0) return 0;

  const weekSet = new Set<string>();
  for (const s of sessions) {
    weekSet.add(getIsoWeekString(new Date(s.date + 'T00:00:00')));
  }

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const weekStr = getIsoWeekString(cursor);
    if (weekSet.has(weekStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }
  return streak;
}

function buildLast12MonthsData(
  sessions: TrainingSession[],
  type: 'shots' | 'sessions',
): MonthlyDataPointDto[] {
  const now = new Date();
  const result: MonthlyDataPointDto[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    let count = 0;
    for (const s of sessions) {
      if (s.date.substring(0, 7) === monthStr) {
        count += type === 'shots' ? (s.shotsCount ?? 0) : 1;
      }
    }
    result.push({ month: monthStr, count });
  }

  return result;
}
