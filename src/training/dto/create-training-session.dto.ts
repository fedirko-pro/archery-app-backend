import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrainingCustomFieldDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  value: string;
}

export class CreateTrainingSessionDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  shotsCount?: number;

  @IsString()
  @IsOptional()
  distance?: string;

  @IsString()
  @IsOptional()
  targetType?: string;

  @IsString()
  @IsOptional()
  equipmentSetId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TrainingCustomFieldDto)
  customFields?: TrainingCustomFieldDto[];
}
