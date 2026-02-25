import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { EquipmentSet } from './equipment-set.entity';

@Module({
  imports: [MikroOrmModule.forFeature([EquipmentSet])],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
