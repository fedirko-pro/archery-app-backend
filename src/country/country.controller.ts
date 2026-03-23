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
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.countryService.findOne(code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  @Post()
  create(@Body() dto: CreateCountryDto) {
    return this.countryService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  @Patch(':code')
  update(@Param('code') code: string, @Body() dto: UpdateCountryDto) {
    return this.countryService.update(code, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.countryService.remove(code);
  }
}
