import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UploadImageDto {
  @IsEnum(['avatar', 'banner'])
  type: 'avatar' | 'banner';

  @IsString()
  entityId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cropX?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cropY?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cropWidth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cropHeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;
}
