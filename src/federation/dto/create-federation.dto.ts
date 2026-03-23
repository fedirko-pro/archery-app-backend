import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateFederationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  shortCode: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;
}
