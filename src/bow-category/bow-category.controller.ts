import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BowCategoryService } from './bow-category.service';
import { CreateBowCategoryDto } from './dto/create-bow-category.dto';
import { UpdateBowCategoryDto } from './dto/update-bow-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/types';

@Controller('bow-categories')
export class BowCategoryController {
  constructor(private readonly bowCategoryService: BowCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  create(@Body() createBowCategoryDto: CreateBowCategoryDto) {
    return this.bowCategoryService.create(createBowCategoryDto);
  }

  @Get()
  findAll(@Query('ruleId') ruleId?: string) {
    return this.bowCategoryService.findAll(ruleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bowCategoryService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.bowCategoryService.findByCode(code);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  update(
    @Param('id') id: string,
    @Body() updateBowCategoryDto: UpdateBowCategoryDto,
  ) {
    return this.bowCategoryService.update(id, updateBowCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  remove(@Param('id') id: string) {
    return this.bowCategoryService.remove(id);
  }
}
