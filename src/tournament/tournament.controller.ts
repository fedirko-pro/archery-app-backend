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
} from '@nestjs/common';
import { wrap } from '@mikro-orm/core';
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';
import { PermissionsService } from '../auth/permissions.service';

@Controller('tournaments')
export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  @Post()
  async create(@Body() data: any, @Request() req: any) {
    if (!this.permissionsService.canCreateTournament(req.user)) {
      throw new ForbiddenException();
    }
    return this.tournamentService.create({ ...data, createdBy: req.user.sub });
  }

  @Get()
  async findAll() {
    const tournaments = await this.tournamentService.findAll();
    // Serialize to plain JSON to avoid class-transformer issues with Patrol class
    return tournaments.map((t) => {
      const json: any = wrap(t).toJSON();
      return {
        ...json,
        ruleCode: t.rule?.ruleCode || null,
        rule: t.rule
          ? {
              id: t.rule.id,
              ruleCode: t.rule.ruleCode,
              ruleName: t.rule.ruleName,
            }
          : null,
        createdBy: t.createdBy
          ? {
              id: t.createdBy.id,
              email: t.createdBy.email,
              firstName: t.createdBy.firstName,
              lastName: t.createdBy.lastName,
              picture: t.createdBy.picture,
              role: t.createdBy.role,
            }
          : null,
      };
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tournament = await this.tournamentService.findById(id);
    // Serialize to plain JSON to avoid class-transformer issues
    const json: any = wrap(tournament).toJSON();
    // Add ruleCode for convenience
    json.ruleCode = tournament.rule?.ruleCode || null;
    return json;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    const tournament = await this.tournamentService.findById(id);
    if (!this.permissionsService.canUpdateTournament(req.user, tournament)) {
      throw new ForbiddenException();
    }
    return this.tournamentService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    if (!this.permissionsService.canDeleteTournament(req.user)) {
      throw new ForbiddenException();
    }
    return this.tournamentService.remove(id);
  }
}
