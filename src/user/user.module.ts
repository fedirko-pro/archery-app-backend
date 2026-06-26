import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PublicProfileController } from './public-profile.controller';
import { PublicProfileService } from './public-profile.service';
import { ProfileVisibilityService } from './profile-visibility.service';
import { UploadModule } from '../upload/upload.module';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { EmailModule } from '../email/email.module';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    UploadModule,
    RolePermissionsModule,
    EmailModule,
    TrainingModule,
  ],
  providers: [UserService, PublicProfileService, ProfileVisibilityService],
  controllers: [UserController, PublicProfileController],
  exports: [UserService],
})
export class UserModule {}
