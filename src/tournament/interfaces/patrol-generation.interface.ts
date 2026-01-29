/**
 * Gender type for participants
 */
export type Gender = 'm' | 'f' | 'other';

/**
 * Input: Participant entry for a specific category
 */
export interface PatrolEntry {
  participantId: string;
  name: string;
  club: string; // Club name from database
  bowCategory: string; // BowCategory code (e.g., 'FSC', 'LB', 'BBC') - NOT name
  division: string; // Division name (e.g., 'Adult Male', 'Junior Female')
  gender: Gender; // 'm', 'f', 'other' - extracted from User or Division
  escalao: string; // Original value from form/division
}

/**
 * Output: Generated patrol
 */
export interface GeneratedPatrol {
  id: string;
  targetNumber: number; // 1-18 (target number)
  members: string[]; // participantIds
  leaderId: string;
  judgeIds: [string, string];
}

/**
 * Competition configuration for patrol generation
 */
export interface PatrolGenerationConfig {
  tournamentId: string;
  bowCategory: string; // Filter by bow category (e.g., 'FSC', 'LB') or 'All Categories'
  targetPatrolCount: number; // Number of targets (patrols) - must be > 0
  groupingPriority?: Array<{
    field: 'division' | 'gender';
    weight: number;
  }>;
  minPatrolSize: number; // Minimum patrol size - must be > 0, default: 3
}

/**
 * Patrol generation statistics
 */
export interface PatrolGenerationStats {
  totalParticipants: number;
  averagePatrolSize: number;
  clubDiversityScore: number; // % of patrols with judges from different clubs
  homogeneityScores: {
    category: number; // % of patrols where all have the same bow category
    division: number; // % of patrols where all have the same division
    gender: number; // % of patrols where all have the same gender
  };
}

/**
 * Complete patrol generation result
 */
export interface PatrolGenerationResult {
  patrols: GeneratedPatrol[];
  stats: PatrolGenerationStats;
}
