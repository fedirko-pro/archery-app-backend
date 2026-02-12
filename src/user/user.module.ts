import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UploadModule } from '../upload/upload.module';
import { RolePermissionsModule } from '../auth/role-permissions.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    UploadModule,
    RolePermissionsModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
