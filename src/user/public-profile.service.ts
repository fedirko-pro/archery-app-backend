import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ProfileVisibilityService,
  ProfileViewer,
} from './profile-visibility.service';
import { TrainingService } from '../training/training.service';
import {
  PublicProfileDto,
  PublicProgressStatsDto,
} from './dto/public-profile.dto';
import { PublicAchievementShareDto } from './dto/public-achievement-share.dto';
import {
  ACHIEVEMENT_CATALOG,
  AchievementRarity,
  isValidAchievementId,
} from './achievement-catalog';
import { User } from './entity/user.entity';
import { ProfileVisibility, ProfileVisibilities } from './types';

@Injectable()
export class PublicProfileService {
  private readonly logger = new Logger(PublicProfileService.name);

  constructor(
    private readonly userService: UserService,
    private readonly visibilityService: ProfileVisibilityService,
    private readonly trainingService: TrainingService,
  ) {}

  async getPublicProfile(userId: string): Promise<PublicProfileDto> {
    const user = await this.userService.findById(userId);
    if (!user || !this.visibilityService.canViewPublicUnauthenticated(user)) {
      throw new NotFoundException('Profile not found');
    }
    return this.buildProfileDto(user, ProfileVisibilities.Public);
  }

  async getSharedProfile(
    userId: string,
    viewer: ProfileViewer,
  ): Promise<PublicProfileDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    const level = this.visibilityService.resolveViewLevel(user, viewer);
    if (level === 'none') {
      throw new NotFoundException('Profile not found');
    }

    const visibility =
      level === 'limited'
        ? ProfileVisibilities.Limited
        : ProfileVisibilities.Public;

    return this.buildProfileDto(user, visibility);
  }

  async getPublicAchievementShare(
    userId: string,
    achievementId: string,
  ): Promise<PublicAchievementShareDto> {
    const user = await this.userService.findById(userId);
    if (!user || !this.visibilityService.canViewPublicUnauthenticated(user)) {
      throw new NotFoundException('Achievement not found');
    }

    return this.buildAchievementShareDto(user, achievementId);
  }

  async getSharedAchievement(
    userId: string,
    achievementId: string,
    viewer: ProfileViewer,
  ): Promise<PublicAchievementShareDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Achievement not found');
    }

    const level = this.visibilityService.resolveViewLevel(user, viewer);
    if (level === 'none') {
      throw new NotFoundException('Achievement not found');
    }

    return this.buildAchievementShareDto(user, achievementId);
  }

  private async buildProfileDto(
    user: User,
    visibility: ProfileVisibility,
  ): Promise<PublicProfileDto> {
    let progress: PublicProgressStatsDto | undefined;
    try {
      const stats = await this.trainingService.getStats(user.id);
      progress = {
        memberSince: stats.registrationDate,
        totalSessions: stats.totalSessions,
        currentStreakWeeks: stats.currentStreakWeeks,
        shotsThisWeek: stats.shots.thisWeek,
        shotsTotal: stats.shots.total,
      };
    } catch (err) {
      this.logger.warn(
        `Failed to load training stats for user ${user.id}`,
        err,
      );
      progress = undefined;
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      bio: user.bio,
      location: user.location,
      country: user.country,
      club: user.club ? { id: user.club.id, name: user.club.name } : null,
      profileVisibility: visibility,
      progress,
    };
  }

  private buildAchievementShareDto(
    user: User,
    achievementId: string,
  ): PublicAchievementShareDto {
    if (!isValidAchievementId(achievementId)) {
      throw new NotFoundException('Achievement not found');
    }

    const catalog = ACHIEVEMENT_CATALOG[achievementId];

    // TODO: compute `earned` and `earnedDate` from real training/tournament data
    return {
      id: achievementId,
      title: catalog.title,
      description: catalog.description,
      rarity: catalog.rarity as AchievementRarity,
      earned: false,
      earnedDate: null,
      owner: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }
}
