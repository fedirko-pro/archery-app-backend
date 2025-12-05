/**
 * Input: Participant entry for a specific category
 */
export interface PatrolEntry {
  participantId: string;
  name: string;
  club: string; // Club name from database
  bowCategory: string; // BowCategory name (e.g., 'FSC', 'LB', 'BBC')
  division: string; // Division name (e.g., 'Adult Male', 'Junior Female')
  gender: string; // 'm', 'f', 'other' - extracted from User or Division
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
  bowCategory: string; // Filter by bow category (e.g., 'FSC', 'LB')
  targetPatrolCount: number; // Number of targets (patrols)
  groupingPriority?: Array<{
    field: 'division' | 'gender';
    weight: number;
  }>;
  minPatrolSize: number; // Default: 3
}

/**
 * Patrol generation statistics
 */
export interface PatrolGenerationStats {
  totalParticipants: number;
  averagePatrolSize: number;
  clubDiversityScore: number; // % of patrols with judges from different clubs
  homogeneityScores: {
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
