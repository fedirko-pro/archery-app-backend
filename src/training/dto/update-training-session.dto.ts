import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingSessionDto } from './create-training-session.dto';

export class UpdateTrainingSessionDto extends PartialType(
  CreateTrainingSessionDto,
) {}
