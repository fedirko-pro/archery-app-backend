import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class GeneratePatrolsDto {
  @IsString()
  @IsNotEmpty()
  bowCategoryId: string;

  @IsNumber()
  @Min(1)
  targetPatrolCount: number;
}
