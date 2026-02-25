import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipmentSetDto } from './create-equipment-set.dto';

export class UpdateEquipmentSetDto extends PartialType(CreateEquipmentSetDto) {}
