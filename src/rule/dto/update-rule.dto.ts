import { PartialType } from '@nestjs/mapped-types';
import { CreateRuleDto } from './create-rule.dto';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {}
