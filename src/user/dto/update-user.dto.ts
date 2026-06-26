import {
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
  IsEmail,
  IsBoolean,
  IsDateString,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { VALID_PROFILE_VISIBILITIES } from '../types';

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

  @IsString()
  @IsOptional()
  country?: string;

  // Allow localhost URLs for development and any valid URL format
  // Only validate URL format if picture is provided and not empty
  @ValidateIf(
    (o) => o.picture !== undefined && o.picture !== null && o.picture !== '',
  )
  @IsUrl({
    require_tld: false,
    require_protocol: false,
    allow_protocol_relative_urls: true,
  })
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

  @IsString()
  @IsOptional()
  clubId?: string;

  @IsString()
  @IsOptional()
  divisionId?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsBoolean()
  @IsOptional()
  syncTrainingsAndEquipment?: boolean;

  @IsIn([...VALID_PROFILE_VISIBILITIES])
  @IsOptional()
  profileVisibility?: (typeof VALID_PROFILE_VISIBILITIES)[number];

  @IsDateString()
  @IsOptional()
  onboardingCompletedAt?: string;
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsString()
  @IsOptional()
  role?: string;
}
