import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { Division } from './division.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Division])],
  controllers: [DivisionController],
  providers: [DivisionService],
  exports: [DivisionService],
})
export class DivisionModule {}
