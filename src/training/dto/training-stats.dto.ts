export class ShotPeriodStatsDto {
  total: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
}

export class MetersPeriodStatsDto {
  total: number;
  thisMonth: number;
  thisYear: number;
}

export class ApplicationStatsForUserDto {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  withdrawn: number;
}

export class MonthlyDataPointDto {
  month: string;
  count: number;
}

export class TrainingStatsDto {
  registrationDate: string;
  totalSessions: number;
  currentStreakWeeks: number;
  shots: ShotPeriodStatsDto;
  metersTraveled: MetersPeriodStatsDto;
  avgShotsPerSession: number;
  mostUsedDistance: string | null;
  mostUsedTargetType: string | null;
  shotsByMonth: MonthlyDataPointDto[];
  sessionsByMonth: MonthlyDataPointDto[];
  tournamentApplications: ApplicationStatsForUserDto;
}
