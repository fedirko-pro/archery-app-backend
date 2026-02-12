import { IsBoolean, IsString } from 'class-validator';

export class UpdateRolePermissionDto {
  @IsString()
  role: string;

  @IsString()
  permissionKey: string;

  @IsBoolean()
  enabled: boolean;
}
