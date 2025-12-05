import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BowCategoryService } from './bow-category.service';
import { BowCategoryController } from './bow-category.controller';
import { BowCategory } from './bow-category.entity';

@Module({
  imports: [MikroOrmModule.forFeature([BowCategory])],
  controllers: [BowCategoryController],
  providers: [BowCategoryService],
  exports: [BowCategoryService],
})
export class BowCategoryModule {}
