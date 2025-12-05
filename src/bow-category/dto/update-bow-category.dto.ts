import { PartialType } from '@nestjs/mapped-types';
import { CreateBowCategoryDto } from './create-bow-category.dto';

export class UpdateBowCategoryDto extends PartialType(CreateBowCategoryDto) {}
