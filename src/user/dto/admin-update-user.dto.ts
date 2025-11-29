import {
  IsOptional,
  IsString,
  IsUrl,
  IsEmail,
  IsIn,
  IsArray,
} from 'class-validator';

export class AdminUpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: string;

  @IsString()
  @IsOptional()
  appLanguage?: string;

  @IsString()
  @IsOptional()
  federationNumber?: string;

  @IsArray()
  @IsOptional()
  categories?: string[];
}
