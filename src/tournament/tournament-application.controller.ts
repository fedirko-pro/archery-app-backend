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
} from '@nestjs/common';
import { wrap } from '@mikro-orm/core';
import { TournamentApplicationService } from './tournament-application.service';
import { ApplicationStatus } from './tournament-application.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';

@Controller('tournament-applications')
export class TournamentApplicationController {
  constructor(
    private readonly applicationService: TournamentApplicationService,
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

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  async findAll() {
    const applications = await this.applicationService.findAll();
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
  @Roles(UserRoles.Admin)
  async findByTournament(@Param('tournamentId') tournamentId: string) {
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
  @Roles(UserRoles.Admin)
  async getTournamentStats(@Param('tournamentId') tournamentId: string) {
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
  @Roles(UserRoles.Admin)
  async updateStatus(
    @Param('id') id: string,
    @Body() data: { status: ApplicationStatus; rejectionReason?: string },
    @Request() req: any,
  ) {
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
  @Roles(UserRoles.Admin)
  async remove(@Param('id') id: string) {
    return this.applicationService.remove(id);
  }
}
