import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateDivisionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  ruleId: string;
}
