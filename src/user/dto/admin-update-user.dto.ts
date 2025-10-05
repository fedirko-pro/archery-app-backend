import { IsOptional, IsString, IsUrl } from 'class-validator';

export class AdminUpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  language?: string;
}
