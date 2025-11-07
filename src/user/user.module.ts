import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), UploadModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
