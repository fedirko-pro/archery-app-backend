import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  shortCode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  clubLogo?: string;

  @IsUUID()
  @IsOptional()
  federationId?: string;
}
