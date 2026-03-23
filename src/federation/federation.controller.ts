import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';
import { FederationService } from './federation.service';
import { CreateFederationDto } from './dto/create-federation.dto';
import { UpdateFederationDto } from './dto/update-federation.dto';

@Controller('federations')
export class FederationController {
  constructor(private readonly federationService: FederationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  create(@Body() dto: CreateFederationDto) {
    return this.federationService.create(dto);
  }

  @Get()
  findAll() {
    return this.federationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.federationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  update(@Param('id') id: string, @Body() dto: UpdateFederationDto) {
    return this.federationService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  remove(@Param('id') id: string) {
    return this.federationService.remove(id);
  }
}
