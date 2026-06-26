/** Stub catalog until achievements are computed from real data (REFOCUS B4). */

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const ACHIEVEMENT_CATALOG: Record<
  string,
  { title: string; description: string; rarity: AchievementRarity }
> = {
  'first-bullseye': {
    title: 'First Bullseye',
    description: 'Score your first perfect 10-point shot in competition',
    rarity: 'common',
  },
  'perfect-round': {
    title: 'Perfect Round',
    description: 'Achieve a perfect score in a single round (all 10s)',
    rarity: 'epic',
  },
  'tournament-winner': {
    title: 'Tournament Champion',
    description: 'Win first place in an official tournament',
    rarity: 'legendary',
  },
  'consistent-archer': {
    title: 'Consistent Archer',
    description: 'Complete 10 tournaments without missing any targets',
    rarity: 'rare',
  },
  'long-distance': {
    title: 'Long Distance Master',
    description: 'Successfully hit targets at 70+ meters',
    rarity: 'rare',
  },
  'team-spirit': {
    title: 'Team Spirit',
    description: 'Participate in 5 team events',
    rarity: 'common',
  },
  'precision-master': {
    title: 'Precision Master',
    description: 'Maintain 95%+ accuracy over 100 shots',
    rarity: 'legendary',
  },
};

export function isValidAchievementId(id: string): boolean {
  return id in ACHIEVEMENT_CATALOG;
}
