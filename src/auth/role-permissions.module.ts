import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RolePermission } from './entity/role-permission.entity';
import { RolePermissionsService } from './role-permissions.service';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [MikroOrmModule.forFeature([RolePermission])],
  providers: [RolePermissionsService, PermissionsService],
  exports: [RolePermissionsService, PermissionsService],
})
export class RolePermissionsModule {}
