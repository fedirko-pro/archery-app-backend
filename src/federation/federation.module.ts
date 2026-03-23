import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Federation } from './federation.entity';
import { FederationService } from './federation.service';
import { FederationController } from './federation.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Federation])],
  providers: [FederationService],
  controllers: [FederationController],
  exports: [FederationService],
})
export class FederationModule {}
