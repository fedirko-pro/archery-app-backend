import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from './types';
import { PermissionsService } from '../auth/permissions.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // Public signup: ignore role so users cannot self-assign admin
    const dto = { ...createUserDto } as CreateUserDto & { role?: string };
    delete dto.role;
    const user = await this.userService.create(dto as CreateUserDto);
    const {
      id,
      email,
      role,
      firstName,
      lastName,
      picture,
      bio,
      location,
      appLanguage,
      federationNumber,
      nationality,
      gender,
      categories,
      club,
      createdAt,
      updatedAt,
    } = user as any;
    return {
      id,
      email,
      role,
      firstName,
      lastName,
      picture,
      bio,
      location,
      language: appLanguage ?? undefined,
      appLanguage: appLanguage ?? undefined,
      federationNumber,
      nationality,
      gender,
      categories: categories ?? [],
      clubId: club?.id ?? null,
      club: club ? { id: club.id, name: club.name } : null,
      createdAt,
      updatedAt,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.userService.findById(req.user.sub).then((user) => {
      if (!user) return null;
      const {
        id,
        email,
        role,
        firstName,
        lastName,
        picture,
        bio,
        location,
        appLanguage,
        federationNumber,
        nationality,
        gender,
        categories,
        club,
        createdAt,
        updatedAt,
      } = user as any;
      return {
        id,
        email,
        role,
        firstName,
        lastName,
        picture,
        bio,
        location,
        language: appLanguage ?? undefined,
        appLanguage: appLanguage ?? undefined,
        federationNumber,
        nationality,
        gender,
        categories,
        clubId: club?.id || null,
        club: club ? { id: club.id, name: club.name } : null,
        createdAt,
        updatedAt,
      };
    });
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const isAdmin = this.permissionsService.canManageUsers(req.user);
    return this.userService.update(req.user.sub, updateUserDto, isAdmin);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.sub, changePasswordDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    if (
      req.user.sub !== id &&
      !this.permissionsService.canDeleteUser(req.user)
    ) {
      throw new ForbiddenException();
    }
    return this.userService.remove(id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  /**
   * Create a new user by an administrator.
   * POST /users/admin/create
   * Sends an invitation email with a set-password link (valid 24h).
   */
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  async adminCreateUser(
    @Body() createUserDto: AdminCreateUserDto,
    @Request() req: any,
  ) {
    const creatorName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
      req.user.email;
    const user = await this.userService.adminCreateUser(
      createUserDto,
      creatorName,
    );
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }

  @Get('admin/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  async getUserById(@Param('userId') userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) return null;
    const {
      id,
      email,
      role,
      firstName,
      lastName,
      picture,
      bio,
      location,
      appLanguage,
      federationNumber,
      nationality,
      gender,
      categories,
      club,
      createdAt,
      updatedAt,
    } = user as any;
    return {
      id,
      email,
      role,
      firstName,
      lastName,
      picture,
      bio,
      location,
      language: appLanguage ?? undefined,
      appLanguage: appLanguage ?? undefined,
      federationNumber,
      nationality,
      gender,
      categories,
      clubId: club?.id || null,
      createdAt,
      updatedAt,
    };
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  adminUpdateUser(
    @Param('id') id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
    @Request() req: any,
  ) {
    const dto = { ...updateUserDto };
    if (
      !this.permissionsService.canChangeRole(req.user) &&
      dto.role !== undefined
    ) {
      delete dto.role;
    }
    const adminName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
      req.user.email;
    return this.userService.adminUpdateUser(id, dto, adminName);
  }
}
