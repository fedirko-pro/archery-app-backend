import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicProfileService } from './public-profile.service';
import { UserService } from './user.service';

@Controller('users')
export class PublicProfileController {
  constructor(
    private readonly publicProfileService: PublicProfileService,
    private readonly userService: UserService,
  ) {}

  @Get('public/:userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.publicProfileService.getPublicProfile(userId);
  }

  @Get('public/:userId/achievements/:achievementId')
  getPublicAchievement(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string,
  ) {
    return this.publicProfileService.getPublicAchievementShare(
      userId,
      achievementId,
    );
  }

  @Get(':userId/shared-profile')
  @UseGuards(JwtAuthGuard)
  async getSharedProfile(@Param('userId') userId: string, @Request() req: any) {
    const viewerUser = await this.userService.findById(req.user.sub);
    return this.publicProfileService.getSharedProfile(userId, {
      sub: req.user.sub,
      role: req.user.role,
      clubId: viewerUser?.club?.id ?? null,
    });
  }

  @Get(':userId/shared-profile/achievements/:achievementId')
  @UseGuards(JwtAuthGuard)
  async getSharedAchievement(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string,
    @Request() req: any,
  ) {
    const viewerUser = await this.userService.findById(req.user.sub);
    return this.publicProfileService.getSharedAchievement(
      userId,
      achievementId,
      {
        sub: req.user.sub,
        role: req.user.role,
        clubId: viewerUser?.club?.id ?? null,
      },
    );
  }
}
