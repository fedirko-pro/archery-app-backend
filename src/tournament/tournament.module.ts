import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Tournament } from './tournament.entity';
import { Patrol } from './patrol.entity';
import { PatrolMember } from './patrol-member.entity';
import { TournamentApplication } from './tournament-application.entity';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { PatrolService } from './patrol.service';
import { PatrolController } from './patrol.controller';
import { PatrolGenerationService } from './patrol-generation.service';
import { PatrolPdfService } from './patrol-pdf.service';
import { TournamentApplicationService } from './tournament-application.service';
import { TournamentApplicationController } from './tournament-application.controller';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';
import { RolePermissionsModule } from '../auth/role-permissions.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Tournament,
      Patrol,
      PatrolMember,
      TournamentApplication,
    ]),
    UploadModule,
    EmailModule,
    RolePermissionsModule,
  ],
  providers: [
    TournamentService,
    PatrolService,
    PatrolGenerationService,
    PatrolPdfService,
    TournamentApplicationService,
  ],
  controllers: [
    TournamentController,
    PatrolController,
    TournamentApplicationController,
  ],
  exports: [MikroOrmModule],
})
export class TournamentModule {}
