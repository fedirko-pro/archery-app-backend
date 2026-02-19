import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { AuthProvider } from '../types';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  // Only validate URL format if picture is provided and not empty
  @ValidateIf(
    (o) => o.picture !== undefined && o.picture !== null && o.picture !== '',
  )
  @IsUrl()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  appLanguage?: string;

  @IsOptional()
  createdAt?: Date;

  @IsString()
  authProvider: AuthProvider;
}
