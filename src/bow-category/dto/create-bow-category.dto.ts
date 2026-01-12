import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBowCategoryDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  descriptionPt?: string;

  @IsString()
  @IsOptional()
  descriptionIt?: string;

  @IsString()
  @IsOptional()
  descriptionUk?: string;

  @IsString()
  @IsOptional()
  descriptionEs?: string;

  @IsString()
  @IsOptional()
  ruleReference?: string;

  @IsString()
  @IsOptional()
  ruleCitation?: string;

  @IsString()
  @IsNotEmpty()
  ruleId: string; // ID of the associated rule
}
