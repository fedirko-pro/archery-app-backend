import { ProfileVisibility } from '../types';

export class PublicProgressStatsDto {
  memberSince: string;
  totalSessions: number;
  currentStreakWeeks: number;
  shotsThisWeek: number;
  shotsTotal: number;
}

export class PublicProfileDto {
  id: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  bio?: string;
  location?: string;
  country?: string;
  club?: { id: string; name: string } | null;
  profileVisibility: ProfileVisibility;
  progress?: PublicProgressStatsDto;
}
