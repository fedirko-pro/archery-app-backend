import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  flagEmoji?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
