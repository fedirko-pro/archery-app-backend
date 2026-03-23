import { PartialType } from '@nestjs/mapped-types';
import { CreateFederationDto } from './create-federation.dto';

export class UpdateFederationDto extends PartialType(CreateFederationDto) {}
