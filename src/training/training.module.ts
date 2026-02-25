import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingSession } from './training-session.entity';

@Module({
  imports: [MikroOrmModule.forFeature([TrainingSession])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
