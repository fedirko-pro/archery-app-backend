import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('trainings')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateTrainingSessionDto) {
    return this.trainingService.create(req.user.sub, createDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.trainingService.findAllForUser(req.user.sub);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.trainingService.getStats(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.trainingService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateTrainingSessionDto,
  ) {
    return this.trainingService.update(id, req.user.sub, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.trainingService.remove(id, req.user.sub);
  }

  @Post('bulk-sync')
  bulkSync(@Request() req: any, @Body() sessions: CreateTrainingSessionDto[]) {
    return this.trainingService.bulkSync(req.user.sub, sessions);
  }
}
