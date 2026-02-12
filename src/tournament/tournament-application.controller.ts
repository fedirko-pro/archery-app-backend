import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { wrap } from '@mikro-orm/core';
import { TournamentApplicationService } from './tournament-application.service';
import { TournamentService } from './tournament.service';
import { ApplicationStatus } from './tournament-application.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';
import { PermissionsService } from '../auth/permissions.service';

@Controller('tournament-applications')
export class TournamentApplicationController {
  constructor(
    private readonly applicationService: TournamentApplicationService,
    private readonly tournamentService: TournamentService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body()
    data: {
      tournamentId: string;
      category?: string;
      division?: string;
      equipment?: string;
      notes?: string;
    },
    @Request() req: any,
  ) {
    return this.applicationService.create({
      ...data,
      applicantId: req.user.sub,
    });
  }

  /**
   * Create a tournament application on behalf of another user (admin only).
   * POST /tournament-applications/admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin, UserRoles.ClubAdmin)
  @Post('admin')
  async createForUser(
    @Body()
    data: {
      tournamentId: string;
      userId: string;
      category?: string;
      division?: string;
      equipment?: string;
      notes?: string;
    },
    @Request() req: any,
  ) {
    // Build the notes with admin attribution
    const adminName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
      req.user.email;
    const adminNote = `Application submitted by admin ${adminName}`;
    const finalNotes = data.notes ? `${adminNote}\n\n${data.notes}` : adminNote;

    return this.applicationService.create({
      tournamentId: data.tournamentId,
      applicantId: data.userId,
      category: data.category,
      division: data.division,
      notes: finalNotes,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  async findAll(@Request() req: any) {
    const applications =
      req.user.role === UserRoles.GeneralAdmin
        ? await this.applicationService.findAll()
        : await this.applicationService.findAllByTournamentCreator(
            req.user.sub,
          );
    // Serialize to plain JSON to avoid class-transformer issues
    return applications.map((app) => {
      const json: any = wrap(app).toJSON();
      return {
        ...json,
        applicant: {
          id: app.applicant.id,
          firstName: app.applicant.firstName,
          lastName: app.applicant.lastName,
          email: app.applicant.email,
          picture: app.applicant.picture,
          gender: app.applicant.gender,
        },
        division: app.division
          ? {
              id: app.division.id,
              name: app.division.name,
            }
          : null,
        bowCategory: app.bowCategory
          ? {
              id: app.bowCategory.id,
              name: app.bowCategory.name,
              code: app.bowCategory.code,
            }
          : null,
      };
    });
  }

  @Get('tournament/:tournamentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  async findByTournament(
    @Param('tournamentId') tournamentId: string,
    @Request() req: any,
  ) {
    let tournament;
    try {
      tournament = await this.tournamentService.findById(tournamentId);
    } catch {
      throw new NotFoundException('Tournament not found');
    }
    if (
      !this.permissionsService.canViewTournamentApplications(
        req.user,
        tournament,
      )
    ) {
      throw new ForbiddenException();
    }
    const applications =
      await this.applicationService.findByTournament(tournamentId);
    // Serialize to plain JSON to avoid class-transformer issues
    return applications.map((app) => {
      const json: any = wrap(app).toJSON();
      return {
        ...json,
        applicant: {
          id: app.applicant.id,
          firstName: app.applicant.firstName,
          lastName: app.applicant.lastName,
          email: app.applicant.email,
          picture: app.applicant.picture,
          gender: app.applicant.gender,
        },
        division: app.division
          ? {
              id: app.division.id,
              name: app.division.name,
            }
          : null,
        bowCategory: app.bowCategory
          ? {
              id: app.bowCategory.id,
              name: app.bowCategory.name,
              code: app.bowCategory.code,
            }
          : null,
      };
    });
  }

  @Get('tournament/:tournamentId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  async getTournamentStats(
    @Param('tournamentId') tournamentId: string,
    @Request() req: any,
  ) {
    let tournament;
    try {
      tournament = await this.tournamentService.findById(tournamentId);
    } catch {
      throw new NotFoundException('Tournament not found');
    }
    if (
      !this.permissionsService.canViewTournamentApplications(
        req.user,
        tournament,
      )
    ) {
      throw new ForbiddenException();
    }
    return this.applicationService.getApplicationStats(tournamentId);
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  async findMyApplications(@Request() req: any) {
    return this.applicationService.findByApplicant(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.applicationService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  async updateStatus(
    @Param('id') id: string,
    @Body() data: { status: ApplicationStatus; rejectionReason?: string },
    @Request() req: any,
  ) {
    if (!this.permissionsService.canManageApplicationsAndPdfs(req.user)) {
      throw new ForbiddenException();
    }
    return this.applicationService.updateStatus(
      id,
      data.status,
      data.rejectionReason,
      req.user.sub, // Pass admin user ID for audit trail
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async withdraw(@Param('id') id: string, @Request() req: any) {
    return this.applicationService.withdraw(id, req.user.sub);
  }

  @Delete(':id/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  async remove(@Param('id') id: string, @Request() req: any) {
    if (!this.permissionsService.canManageApplicationsAndPdfs(req.user)) {
      throw new ForbiddenException();
    }
    return this.applicationService.remove(id);
  }
}
