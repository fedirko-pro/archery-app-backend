import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminCreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
