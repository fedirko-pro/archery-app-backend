import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';
import { Rule } from './rule.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Rule])],
  controllers: [RuleController],
  providers: [RuleService],
  exports: [RuleService],
})
export class RuleModule {}
