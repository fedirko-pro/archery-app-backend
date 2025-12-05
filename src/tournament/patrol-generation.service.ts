import { Injectable } from '@nestjs/common';
import {
  PatrolEntry,
  PatrolGenerationConfig,
  PatrolGenerationResult,
  GeneratedPatrol,
  PatrolGenerationStats,
} from './interfaces/patrol-generation.interface';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PatrolGenerationService {
  /**
   * Main function to generate patrols
   */
  generatePatrols(
    entries: PatrolEntry[],
    config: PatrolGenerationConfig,
  ): PatrolGenerationResult {
    if (entries.length === 0) {
      return {
        patrols: [],
        stats: this.createEmptyStats(),
      };
    }

    // 1. GROUP BY SIMILARITY (division + gender)
    const groups = this.groupBySimilarity(entries);

    // 2. CALCULATE TARGET SIZES
    const avgSize = Math.ceil(entries.length / config.targetPatrolCount);
    const minSize = Math.max(config.minPatrolSize, Math.floor(avgSize * 0.8));
    const maxSize = Math.ceil(avgSize * 1.2);

    // 3. INITIAL PATROL FORMATION
    let patrols = this.formInitialPatrols(groups, minSize, maxSize);

    // 4. ADJUST TO TARGET COUNT
    patrols = this.adjustToTargetCount(
      patrols,
      config.targetPatrolCount,
      minSize,
      maxSize,
      entries,
    );

    // 5. BALANCE PATROL SIZES
    patrols = this.balancePatrolSizes(patrols, minSize, maxSize, entries);

    // 6. BALANCE CLUBS (best effort)
    patrols = this.balanceClubs(patrols, entries);

    // 7. ASSIGN ROLES
    const finalPatrols = this.assignRoles(patrols, entries);

    // 8. CALCULATE STATS
    const stats = this.calculateStats(finalPatrols, entries);

    return {
      patrols: finalPatrols,
      stats,
    };
  }

  /**
   * Step 1: Group entries by similarity (division + gender)
   */
  private groupBySimilarity(
    entries: PatrolEntry[],
  ): Map<string, PatrolEntry[]> {
    const groups = new Map<string, PatrolEntry[]>();

    for (const entry of entries) {
      const key = `${entry.division}|${entry.gender}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    }

    return groups;
  }

  /**
   * Step 3: Form initial patrols from groups
   */
  private formInitialPatrols(
    groups: Map<string, PatrolEntry[]>,
    minSize: number,
    maxSize: number,
  ): string[][] {
    const patrols: string[][] = [];

    for (const [, groupEntries] of groups) {
      const groupCopy = [...groupEntries];

      while (groupCopy.length > 0) {
        const size = Math.min(Math.max(groupCopy.length, minSize), maxSize);
        const patrolMembers = groupCopy.splice(0, size);
        patrols.push(patrolMembers.map((e) => e.participantId));
      }
    }

    return patrols;
  }

  /**
   * Step 4: Adjust number of patrols to target count
   */
  private adjustToTargetCount(
    patrols: string[][],
    targetCount: number,
    minSize: number,
    maxSize: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _entries: PatrolEntry[],
  ): string[][] {
    // If we have more patrols than needed, merge smaller ones
    while (patrols.length > targetCount) {
      patrols = this.mergeSmallerPatrols(patrols, maxSize);
    }

    // If we have fewer patrols than needed, split larger ones
    while (patrols.length < targetCount && patrols.length > 0) {
      const canSplit = patrols.some((p) => p.length >= minSize * 2);
      if (!canSplit) break;

      patrols = this.splitLargerPatrols(patrols, minSize);
    }

    return patrols;
  }

  /**
   * Merge two smallest patrols
   */
  private mergeSmallerPatrols(
    patrols: string[][],
    maxSize: number,
  ): string[][] {
    if (patrols.length < 2) return patrols;

    // Sort by size
    const sorted = patrols.sort((a, b) => a.length - b.length);

    // Try to merge the two smallest if it doesn't exceed maxSize
    if (sorted[0].length + sorted[1].length <= maxSize) {
      const merged = [...sorted[0], ...sorted[1]];
      return [merged, ...sorted.slice(2)];
    }

    // If can't merge, remove the smallest and distribute its members
    const smallest = sorted[0];
    const remaining = sorted.slice(1);

    smallest.forEach((member, idx) => {
      remaining[idx % remaining.length].push(member);
    });

    return remaining;
  }

  /**
   * Split the largest patrol
   */
  private splitLargerPatrols(patrols: string[][], minSize: number): string[][] {
    // Sort by size descending
    const sorted = patrols.sort((a, b) => b.length - a.length);
    const largest = sorted[0];

    if (largest.length < minSize * 2) {
      return patrols; // Can't split
    }

    // Split in half
    const mid = Math.floor(largest.length / 2);
    const patrol1 = largest.slice(0, mid);
    const patrol2 = largest.slice(mid);

    return [patrol1, patrol2, ...sorted.slice(1)];
  }

  /**
   * Step 5: Balance patrol sizes
   */
  private balancePatrolSizes(
    patrols: string[][],
    minSize: number,
    maxSize: number,
    entries: PatrolEntry[],
  ): string[][] {
    let iterations = 0;
    const maxIterations = 100;

    while (iterations < maxIterations) {
      patrols.sort((a, b) => a.length - b.length);
      const smallest = patrols[0];
      const largest = patrols[patrols.length - 1];

      if (largest.length - smallest.length <= 1) {
        break; // Balanced enough
      }

      // Move best candidate from largest to smallest
      const candidate = this.findBestCandidateForMove(
        largest,
        smallest,
        entries,
      );

      if (candidate) {
        // Move the candidate
        const index = largest.indexOf(candidate);
        if (index > -1) {
          largest.splice(index, 1);
          smallest.push(candidate);
        }
      } else {
        break; // Can't improve further
      }

      iterations++;
    }

    return patrols;
  }

  /**
   * Find the best person to move from source to target patrol
   */
  private findBestCandidateForMove(
    sourcePatrol: string[],
    targetPatrol: string[],
    entries: PatrolEntry[],
  ): string | null {
    // Get patrol characteristics
    const targetDivisions = targetPatrol
      .map((id) => entries.find((e) => e.participantId === id)?.division)
      .filter(Boolean);
    const targetGenders = targetPatrol
      .map((id) => entries.find((e) => e.participantId === id)?.gender)
      .filter(Boolean);

    const commonDivision = this.getMostCommon(targetDivisions);
    const commonGender = this.getMostCommon(targetGenders);

    let bestCandidate: string | null = null;
    let bestScore = -1;

    for (const participantId of sourcePatrol) {
      const entry = entries.find((e) => e.participantId === participantId);
      if (!entry) continue;

      let score = 0;
      if (entry.division === commonDivision) score += 5;
      if (entry.gender === commonGender) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = participantId;
      }
    }

    return bestCandidate;
  }

  /**
   * Step 6: Balance clubs (best effort to have diverse clubs for judges)
   */
  private balanceClubs(
    patrols: string[][],
    entries: PatrolEntry[],
  ): string[][] {
    // For each patrol with low club diversity, try to swap with others
    for (let i = 0; i < patrols.length; i++) {
      const patrol = patrols[i];
      const clubs = this.getUniqueClubs(patrol, entries);

      if (clubs.length < 2 && patrol.length >= 2) {
        // Try to find a swap with another patrol
        for (let j = 0; j < patrols.length; j++) {
          if (i === j) continue;

          const otherPatrol = patrols[j];
          const otherClubs = this.getUniqueClubs(otherPatrol, entries);

          if (otherClubs.length > 2) {
            // Try to swap members
            const swapped = this.trySwapForDiversity(
              patrol,
              otherPatrol,
              entries,
            );
            if (swapped) break;
          }
        }
      }
    }

    return patrols;
  }

  /**
   * Try to swap members between two patrols to improve diversity
   */
  private trySwapForDiversity(
    patrol1: string[],
    patrol2: string[],
    entries: PatrolEntry[],
  ): boolean {
    const patrol1Clubs = this.getUniqueClubs(patrol1, entries);
    const patrol2Clubs = this.getUniqueClubs(patrol2, entries);

    // Find a member from patrol2 with a club not in patrol1
    for (const member2 of patrol2) {
      const member2Entry = entries.find((e) => e.participantId === member2);
      if (!member2Entry) continue;

      if (!patrol1Clubs.includes(member2Entry.club)) {
        // Find a member from patrol1 to swap
        for (const member1 of patrol1) {
          const member1Entry = entries.find((e) => e.participantId === member1);
          if (!member1Entry) continue;

          // Check if swap improves diversity
          const newPatrol1Clubs = [
            ...patrol1Clubs.filter((c) => c !== member1Entry.club),
            member2Entry.club,
          ];
          const newPatrol2Clubs = [
            ...patrol2Clubs.filter((c) => c !== member2Entry.club),
            member1Entry.club,
          ];

          if (
            new Set(newPatrol1Clubs).size > patrol1Clubs.length ||
            new Set(newPatrol2Clubs).size >= patrol2Clubs.length - 1
          ) {
            // Perform swap
            const idx1 = patrol1.indexOf(member1);
            const idx2 = patrol2.indexOf(member2);
            patrol1[idx1] = member2;
            patrol2[idx2] = member1;
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Step 7: Assign roles (leader and judges)
   */
  private assignRoles(
    patrols: string[][],
    entries: PatrolEntry[],
  ): GeneratedPatrol[] {
    return patrols.map((members, index) => {
      const judges = this.selectJudges(members, entries);
      const leaderId = this.selectLeader(members, judges, entries);

      return {
        id: uuid(),
        targetNumber: index + 1,
        members,
        leaderId,
        judgeIds: judges as [string, string],
      };
    });
  }

  /**
   * Select 2 judges, preferably from different clubs
   */
  private selectJudges(
    members: string[],
    entries: PatrolEntry[],
  ): [string, string] {
    if (members.length < 2) {
      // Fallback: duplicate if not enough members
      return [members[0], members[0]];
    }

    // Group members by club
    const clubMap = new Map<string, string[]>();
    for (const memberId of members) {
      const entry = entries.find((e) => e.participantId === memberId);
      if (!entry) continue;

      if (!clubMap.has(entry.club)) {
        clubMap.set(entry.club, []);
      }
      clubMap.get(entry.club)!.push(memberId);
    }

    // If we have at least 2 different clubs, pick one from each
    const clubs = Array.from(clubMap.keys());
    if (clubs.length >= 2) {
      const judge1 = clubMap.get(clubs[0])![0];
      const judge2 = clubMap.get(clubs[1])![0];
      return [judge1, judge2];
    }

    // Otherwise, pick any two members
    return [members[0], members[1]];
  }

  /**
   * Select a leader (random member excluding judges)
   */
  private selectLeader(
    members: string[],
    judges: [string, string],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _entries: PatrolEntry[],
  ): string {
    const availableMembers = members.filter((m) => !judges.includes(m));

    if (availableMembers.length > 0) {
      return availableMembers[
        Math.floor(Math.random() * availableMembers.length)
      ];
    }

    // Fallback: if all members are judges, pick randomly
    return members[Math.floor(Math.random() * members.length)];
  }

  /**
   * Step 8: Calculate statistics
   */
  private calculateStats(
    patrols: GeneratedPatrol[],
    entries: PatrolEntry[],
  ): PatrolGenerationStats {
    if (patrols.length === 0) {
      return this.createEmptyStats();
    }

    const totalParticipants = entries.length;
    const averagePatrolSize = totalParticipants / patrols.length;

    // Club diversity: % of patrols with judges from different clubs
    let diversePatrols = 0;
    for (const patrol of patrols) {
      const judge1 = entries.find(
        (e) => e.participantId === patrol.judgeIds[0],
      );
      const judge2 = entries.find(
        (e) => e.participantId === patrol.judgeIds[1],
      );

      if (judge1 && judge2 && judge1.club !== judge2.club) {
        diversePatrols++;
      }
    }
    const clubDiversityScore = (diversePatrols / patrols.length) * 100;

    // Division homogeneity
    let homogeneousDivisionPatrols = 0;
    for (const patrol of patrols) {
      const divisions = patrol.members.map(
        (id) => entries.find((e) => e.participantId === id)?.division,
      );
      if (new Set(divisions).size === 1) {
        homogeneousDivisionPatrols++;
      }
    }
    const divisionHomogeneity =
      (homogeneousDivisionPatrols / patrols.length) * 100;

    // Gender homogeneity
    let homogeneousGenderPatrols = 0;
    for (const patrol of patrols) {
      const genders = patrol.members.map(
        (id) => entries.find((e) => e.participantId === id)?.gender,
      );
      if (new Set(genders).size === 1) {
        homogeneousGenderPatrols++;
      }
    }
    const genderHomogeneity = (homogeneousGenderPatrols / patrols.length) * 100;

    return {
      totalParticipants,
      averagePatrolSize,
      clubDiversityScore,
      homogeneityScores: {
        division: divisionHomogeneity,
        gender: genderHomogeneity,
      },
    };
  }

  /**
   * Helper: Get unique clubs from patrol members
   */
  private getUniqueClubs(members: string[], entries: PatrolEntry[]): string[] {
    const clubs = members
      .map((id) => entries.find((e) => e.participantId === id)?.club)
      .filter((club): club is string => Boolean(club));

    return Array.from(new Set(clubs));
  }

  /**
   * Helper: Get most common value in array
   */
  private getMostCommon(arr: (string | undefined)[]): string | undefined {
    if (arr.length === 0) return undefined;

    const counts = new Map<string, number>();
    for (const item of arr) {
      if (item) {
        counts.set(item, (counts.get(item) || 0) + 1);
      }
    }

    let maxCount = 0;
    let mostCommon: string | undefined;

    for (const [item, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    }

    return mostCommon;
  }

  /**
   * Helper: Create empty stats
   */
  private createEmptyStats(): PatrolGenerationStats {
    return {
      totalParticipants: 0,
      averagePatrolSize: 0,
      clubDiversityScore: 0,
      homogeneityScores: {
        division: 0,
        gender: 0,
      },
    };
  }
}
