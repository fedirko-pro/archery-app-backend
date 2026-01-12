import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { Club } from './club.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [MikroOrmModule.forFeature([Club]), UploadModule],
  controllers: [ClubController],
  providers: [ClubService],
  exports: [ClubService],
})
export class ClubModule {}
