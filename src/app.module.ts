import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { envSchema } from './config/env.zod';
import { TournamentModule } from './tournament/tournament.module';
import { UploadModule } from './upload/upload.module';
import { ClubModule } from './club/club.module';
import { RuleModule } from './rule/rule.module';
import { DivisionModule } from './division/division.module';
import { BowCategoryModule } from './bow-category/bow-category.module';
import { EquipmentModule } from './equipment/equipment.module';
import { TrainingModule } from './training/training.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const parsed = envSchema.safeParse(config);

        if (!parsed.success) {
          throw new Error(`Config validation error: ${parsed.error.message}`);
        }

        return parsed.data;
      },
    }),
    MikroOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    EmailModule,
    TournamentModule,
    UploadModule,
    ClubModule,
    RuleModule,
    DivisionModule,
    BowCategoryModule,
    EquipmentModule,
    TrainingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
