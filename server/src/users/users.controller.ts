import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CacheKey } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CacheKey('users-list')
  @CacheTTL(120) // Cache User List for 2 minutes
  async getUsers(): Promise<User[]> {
    return await this.usersService.users({
      skip: 0,
      take: 10,
      orderBy: {
        id: 'asc',
      },
    });
  }

  @Get(':id')
  @CacheTTL(300) // Cache Single User for 5 minutes
  async getUser(@Param('id') id: string): Promise<User | null> {
    return await this.usersService.user({
      id,
    });
  }

  @Post()
  async createUser(@Body() userInput: CreateUserDto): Promise<User> {
    const user = await this.usersService.createUser(userInput);
    await this.usersService.clearCache('users-list');
    return user;
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() userInput: UpdateUserDto) {
    const user = await this.usersService.updateUser({
      where: { id },
      data: userInput,
    });
    await this.usersService.clearCache(`users:${id}`);
    await this.usersService.clearCache('users-list');
    return user;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const deletedUser = await this.usersService.deleteUser({ id });
    await this.usersService.clearCache(`users:${id}`);
    await this.usersService.clearCache('users-list');
    return deletedUser;
  }
}
