import { IsOptional, IsString, IsUrl, IsArray, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;
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
  picture?: string;

  @IsString()
  @IsOptional()
  appLanguage?: string;

  @IsString()
  @IsOptional()
  federationNumber?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsString()
  @IsOptional()
  role?: string;
}
