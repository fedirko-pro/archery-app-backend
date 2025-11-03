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
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Post()
  async create(@Body() data: any, @Request() req: any) {
    return this.tournamentService.create({ ...data, createdBy: req.user.sub });
  }

  @Get()
  async findAll() {
    const tournaments = await this.tournamentService.findAll();
    // Serialize to plain JSON to avoid class-transformer issues with Patrol class
    return tournaments.map((t) => ({
      ...t,
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
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tournamentService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.tournamentService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
}
