import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomFieldDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  value: string;
}

export class CreateEquipmentSetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  bowType?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  drawWeight?: string;

  @IsString()
  @IsOptional()
  arrowLength?: string;

  @IsString()
  @IsOptional()
  arrowSpine?: string;

  @IsString()
  @IsOptional()
  arrowWeight?: string;

  @IsString()
  @IsOptional()
  arrowMaterial?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customFields?: CustomFieldDto[];
}
