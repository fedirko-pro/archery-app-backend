import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Request as ExpressRequest, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Roles as UserRoles } from '../user/types';
import { RolePermissionsService } from './role-permissions.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: UserLoginDto,
  ): Promise<{ access_token: string }> {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setPasswordForOAuthUser(
    @Request() req: ExpressRequest,
    @Body() setPasswordDto: SetPasswordDto,
  ): Promise<{ message: string }> {
    const user = req.user as any;
    return this.authService.setPasswordForOAuthUser(user.id, setPasswordDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Request() req: ExpressRequest,
    @Res() res: Response,
  ) {
    const { jwt } = req.user as any;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUrl = `${frontendUrl}/auth/google/callback?token=${jwt}`;
    res.redirect(redirectUrl);
  }

  @Get('google/test')
  async testGoogleConfig() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const callbackUrl = this.configService.get<string>('GOOGLE_CALLBACK_URL');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    return {
      message: 'Google OAuth Configuration Test',
      clientId: clientId ? 'Configured' : 'Missing',
      callbackUrl,
      frontendUrl,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('admin/reset-password/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @HttpCode(HttpStatus.OK)
  async adminResetUserPassword(
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.authService.adminResetUserPassword(userId);
  }

  @Get('admin/role-permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  getRolePermissions() {
    return this.rolePermissionsService.getMatrix();
  }

  @Patch('admin/role-permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  @HttpCode(HttpStatus.OK)
  async updateRolePermission(@Body() dto: UpdateRolePermissionDto) {
    await this.rolePermissionsService.setPermission(
      dto.role,
      dto.permissionKey,
      dto.enabled,
    );
    return { message: 'OK' };
  }
}
