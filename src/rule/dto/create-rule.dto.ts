import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  ruleCode: string;

  @IsString()
  @IsNotEmpty()
  ruleName: string;

  @IsString()
  @IsOptional()
  edition?: string;

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

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  downloadLink?: string;
}
