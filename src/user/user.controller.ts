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
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from './types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
        website,
        language,
        federationNumber,
        categories,
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
        website,
        language,
        federationNumber,
        categories,
        createdAt,
        updatedAt,
      };
    });
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.sub, updateUserDto);
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
    if (req.user.sub !== id && req.user.role !== UserRoles.Admin) {
      throw new ForbiddenException();
    }
    return this.userService.remove(id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  adminUpdateUser(
    @Param('id') id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
  ) {
    return this.userService.adminUpdateUser(id, updateUserDto);
  }
}
