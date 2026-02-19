import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from './types';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { UploadService } from '../upload/upload.service';
import { Club } from '../club/club.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly entityManager: EntityManager,
    private readonly uploadService: UploadService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

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

    // Send welcome email — fire-and-forget, never block or fail the signup
    this.emailService
      .sendWelcomeEmail(
        user.email,
        user.firstName ?? user.email.split('@')[0],
        user.appLanguage,
      )
      .catch((err) => {
        this.logger.error(
          `Failed to send welcome email to ${user.email}:`,
          err.message,
        );
      });

    return user;
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    if (includePassword) {
      // Use getConnection().execute() with proper parameter binding for PostgreSQL
      const connection = this.entityManager.getConnection();
      const result = await connection.execute(
        'SELECT * FROM "user" WHERE email = ?',
        [email],
        'get',
      );
      if (!result) return null;
      return this.entityManager.map(User, result);
    }
    return this.entityManager.findOne(User, { email });
  }

  async findById(id: string): Promise<User | null> {
    return this.entityManager.findOne(User, { id }, { populate: ['club'] });
  }

  async update(
    id: string,
    updateData: UpdateUserDto,
    isAdmin: boolean = false,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const safeUpdate: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData as any)) {
      if (value !== undefined) {
        safeUpdate[key] = value;
      }
    }

    delete (safeUpdate as any).role;
    if (!isAdmin) {
      delete (safeUpdate as any).email;
    }

    // Handle clubId separately
    if ('clubId' in safeUpdate) {
      const clubId = safeUpdate.clubId as string | undefined;
      delete (safeUpdate as any).clubId;

      if (clubId && clubId.trim() !== '') {
        const club = await this.entityManager.findOne(Club, { id: clubId });
        if (!club) {
          throw new NotFoundException(`Club with id ${clubId} not found`);
        }
        user.club = club;
      } else {
        user.club = undefined;
      }
    }

    Object.assign(user, safeUpdate);
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);
    return user;
  }

  async changePassword(
    id: string,
    passwordData: ChangePasswordDto,
  ): Promise<{ message: string }> {
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

    return { message: 'Password changed successfully' };
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

  async getAllUsers(): Promise<any[]> {
    const em = this.entityManager.fork();

    // Load users and clubs separately to avoid lazy loading issues
    const users = await em.find(
      User,
      {},
      { orderBy: { firstName: 'ASC', lastName: 'ASC' } },
    );

    // Get all unique club IDs (filter out undefined)
    const clubIds = [
      ...new Set(
        users.map((u) => u.club?.id).filter((id): id is string => !!id),
      ),
    ];

    // Load all clubs at once
    const clubs =
      clubIds.length > 0 ? await em.find(Club, { id: { $in: clubIds } }) : [];

    // Create club lookup map
    const clubMap = new Map(clubs.map((c) => [c.id, c]));

    // Transform to plain objects with club data
    return users.map((user) => {
      const club = user.club ? clubMap.get(user.club.id) : null;
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        picture: user.picture,
        bio: user.bio,
        location: user.location,
        gender: user.gender,
        nationality: user.nationality,
        federationNumber: user.federationNumber,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        categories: user.categories || [],
        club: club ? { id: club.id, name: club.name } : null,
      };
    });
  }

  async adminUpdateUser(
    id: string,
    updateData: AdminUpdateUserDto,
    adminName?: string,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Capture old role before update to detect change
    const oldRole = user.role;

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    const safeUpdate: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData as any)) {
      if (value !== undefined) {
        safeUpdate[key] = value;
      }
    }

    // Handle clubId separately
    if ('clubId' in safeUpdate) {
      const clubId = safeUpdate.clubId as string | undefined;
      delete (safeUpdate as any).clubId;

      if (clubId && clubId.trim() !== '') {
        const club = await this.entityManager.findOne(Club, { id: clubId });
        if (!club) {
          throw new NotFoundException(`Club with id ${clubId} not found`);
        }
        user.club = club;
      } else {
        user.club = undefined;
      }
    }

    Object.assign(user, safeUpdate);
    user.updatedAt = new Date();

    await this.entityManager.persistAndFlush(user);

    // Send role-change notification if role was updated
    const newRole = user.role;
    if (updateData.role && newRole !== oldRole && adminName) {
      const recipientName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
      this.emailService
        .sendRoleChangedEmail(
          user.email,
          recipientName,
          adminName,
          oldRole,
          newRole,
          user.appLanguage,
        )
        .catch((err) => {
          this.logger.error(
            `Failed to send role-change email to ${user.email}:`,
            err.message,
          );
        });
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Clean up user files (avatar) before deleting the user
    await this.uploadService.cleanupUserFiles(id);

    await this.entityManager.removeAndFlush(user);
  }

  /**
   * Create a new user by an administrator and send an invitation email
   * with a set-password link (valid for 24 hours).
   */
  async adminCreateUser(
    data: AdminCreateUserDto,
    creatorName: string,
  ): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const bioText = data.comment
      ? `User created by administrator ${creatorName}. Comment: ${data.comment}`
      : `User created by administrator ${creatorName}`;

    // Generate set-password token valid for 24 hours
    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 24 * 3600 * 1000);

    const user = this.entityManager.create(User, {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: bioText,
      role: Roles.User,
      authProvider: 'local',
      resetPasswordToken: inviteToken,
      resetPasswordExpires: inviteExpires,
      createdAt: new Date(),
    });

    await this.entityManager.persistAndFlush(user);

    // Send invitation email — fire-and-forget
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const setPasswordUrl = `${frontendUrl}/reset-password?token=${inviteToken}`;
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
    const recipientName = fullName || data.email;

    this.emailService
      .sendInvitationEmail(
        user.email,
        recipientName,
        creatorName,
        setPasswordUrl,
        data.appLanguage,
      )
      .catch((err) => {
        this.logger.error(
          `Failed to send invitation email to ${user.email}:`,
          err.message,
        );
      });

    return user;
  }
}
