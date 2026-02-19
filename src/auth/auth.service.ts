import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { UserLoginDto } from './dto/user-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email, true);
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      return user;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async login(loginDto: UserLoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userService.setResetPasswordToken(
      user.id,
      resetToken,
      resetPasswordExpires,
    );

    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        resetUrl,
        user.appLanguage,
      );
    } catch {
      await this.userService.clearResetPasswordToken(user.id);
      throw new Error(
        'Failed to send password reset email. Please try again later.',
      );
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByResetToken(
      resetPasswordDto.token,
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      await this.userService.clearResetPasswordToken(user.id);
      throw new BadRequestException('Reset token has expired');
    }

    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Update password and clear reset token
    await this.userService.updatePasswordAndClearResetToken(
      user.id,
      resetPasswordDto.password,
    );

    return { message: 'Password has been reset successfully' };
  }

  async setPasswordForOAuthUser(
    userId: string,
    passwordData: { password: string; confirmPassword: string },
  ): Promise<{ message: string }> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.authProvider !== 'google') {
      throw new BadRequestException('This method is only for OAuth users');
    }

    if (user.password) {
      throw new BadRequestException('User already has a password set');
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (passwordData.password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    await this.userService.setPasswordForOAuthUser(
      userId,
      passwordData.password,
    );

    return { message: 'Password has been set successfully' };
  }

  async adminResetUserPassword(userId: string): Promise<{ message: string }> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userService.setResetPasswordToken(
      user.id,
      resetToken,
      resetPasswordExpires,
    );

    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        resetUrl,
        user.appLanguage,
      );
    } catch {
      await this.userService.clearResetPasswordToken(user.id);
      throw new Error(
        'Failed to send password reset email. Please try again later.',
      );
    }

    return {
      message: 'Password reset email has been sent to the user',
    };
  }
}
