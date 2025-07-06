import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from './types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly entityManager: EntityManager) {}

  async create(userData: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    let hashedPassword = undefined;
    if (userData.password) {
      if (userData.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }

    const user = this.entityManager.create(User, {
      ...userData,
      password: hashedPassword,
      role: userData.role || Roles.User,
      createdAt: new Date(),
    });

    await this.entityManager.persistAndFlush(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.entityManager.findOne(User, { email });
  }

  async findById(id: string): Promise<User | null> {
    return this.entityManager.findOne(User, { id });
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
    return user;
  }

  async changePassword(
    id: string,
    passwordData: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'User does not have a password set (OAuth user)',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match',
      );
    }

    if (passwordData.newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters long',
      );
    }

    const isSamePassword = await bcrypt.compare(
      passwordData.newPassword,
      user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 10);

    user.password = hashedNewPassword;
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
  }

  async setResetPasswordToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.entityManager.findOne(User, { resetPasswordToken: token });
  }

  async clearResetPasswordToken(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
  }

  async updatePasswordAndClearResetToken(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
  }

  async setPasswordForOAuthUser(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.authProvider !== 'google') {
      throw new BadRequestException('This method is only for OAuth users');
    }

    if (user.password) {
      throw new BadRequestException('User already has a password set');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.entityManager.find(User, {});
  }

  async adminUpdateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.entityManager.removeAndFlush(user);
  }
}
