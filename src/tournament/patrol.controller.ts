import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { format } from 'date-fns';
import { PatrolService } from './patrol.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';

@Controller('patrols')
export class PatrolController {
  constructor(private readonly patrolService: PatrolService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post()
  async create(@Body() data: any) {
    return this.patrolService.create(data);
  }

  @Get()
  async findAll() {
    return this.patrolService.findAll();
  }

  @Get('tournament/:tournamentId')
  async findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.patrolService.findByTournament(tournamentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patrolService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.patrolService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patrolService.remove(id);
  }

  /**
   * Delete patrol and redistribute its members into remaining patrols of the tournament.
   * POST /patrols/:patrolId/delete-and-redistribute
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post(':patrolId/delete-and-redistribute')
  async deleteAndRedistribute(@Param('patrolId') patrolId: string) {
    return this.patrolService.deletePatrolAndRedistribute(patrolId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post(':patrolId/members')
  async addMember(
    @Param('patrolId') patrolId: string,
    @Body() data: { userId: string; role: string },
  ) {
    return this.patrolService.addMember(
      patrolId,
      data.userId,
      data.role as any,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Delete(':patrolId/members/:userId')
  async removeMember(
    @Param('patrolId') patrolId: string,
    @Param('userId') userId: string,
  ) {
    return this.patrolService.removeMember(patrolId, userId);
  }

  /**
   * Generate patrols for a tournament based on all approved applications
   * POST /patrols/tournaments/:tournamentId/generate
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post('tournaments/:tournamentId/generate')
  async generatePatrols(@Param('tournamentId') tournamentId: string) {
    return this.patrolService.generatePatrolsForTournament(tournamentId);
  }

  /**
   * Generate and save patrols to database
   * POST /patrols/tournaments/:tournamentId/generate-and-save
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post('tournaments/:tournamentId/generate-and-save')
  async generateAndSavePatrols(@Param('tournamentId') tournamentId: string) {
    // First generate
    const generatedPatrols =
      await this.patrolService.generatePatrolsForTournament(tournamentId);

    // Then save
    const savedPatrols = await this.patrolService.saveGeneratedPatrols(
      tournamentId,
      generatedPatrols,
    );

    return {
      patrols: savedPatrols,
      stats: generatedPatrols.stats,
    };
  }

  /**
   * Generate PDF for patrols of a tournament
   * GET /patrols/tournaments/:tournamentId/pdf
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Get('tournaments/:tournamentId/pdf')
  async generatePatrolPdf(
    @Param('tournamentId') tournamentId: string,
    @Res() res: Response,
  ) {
    const { buffer, tournamentTitle, startDate } =
      await this.patrolService.generatePatrolPdf(tournamentId);

    // Sanitize tournament title for filename (remove special chars, replace spaces with dashes)
    const sanitizedTitle = tournamentTitle
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const dateStr = format(startDate, 'dd-MM-yyyy');
    const filename = `patrols-list-${sanitizedTitle}-${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  /**
   * Generate PDF with score cards for all patrol members
   * GET /patrols/tournaments/:tournamentId/score-cards-pdf
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Get('tournaments/:tournamentId/score-cards-pdf')
  async generateScoreCardsPdf(
    @Param('tournamentId') tournamentId: string,
    @Res() res: Response,
  ) {
    const { buffer, tournamentTitle, startDate } =
      await this.patrolService.generateScoreCardsPdf(tournamentId);

    // Sanitize tournament title for filename (remove special chars, replace spaces with dashes)
    const sanitizedTitle = tournamentTitle
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const dateStr = format(startDate, 'dd-MM-yyyy');
    const filename = `score-cards-${sanitizedTitle}-${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
