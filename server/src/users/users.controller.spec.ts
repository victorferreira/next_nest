import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  phone: '1234567890',
  website: 'https://example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  users: jest.fn(),
  user: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  clearCache: jest.fn(),
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      usersService.users.mockResolvedValue([mockUser]);
      const result = await usersController.getUsers();
      expect(result).toEqual([mockUser]);
      expect(usersService.users).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('getUser', () => {
    it('should return a single user', async () => {
      usersService.user.mockResolvedValue(mockUser);
      const result = await usersController.getUser('1');
      expect(result).toEqual(mockUser);
      expect(usersService.user).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('createUser', () => {
    it('should create a user and clear users-list cache', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        name: 'John Doe',
        phone: '1234567890',
        website: 'https://example.com',
      };
      usersService.createUser.mockResolvedValue(mockUser);

      const result = await usersController.createUser(createUserDto);
      expect(result).toEqual(mockUser);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(usersService.clearCache).toHaveBeenCalledWith('users-list');
    });
  });

  describe('updateUser', () => {
    it('should update a user and clear appropriate caches', async () => {
      const updateUserDto: UpdateUserDto = { id: '1', name: 'Jane Doe' };
      usersService.updateUser.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await usersController.updateUser('1', updateUserDto);
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
      expect(usersService.updateUser).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateUserDto,
      });
      expect(usersService.clearCache).toHaveBeenCalledWith('users:1');
      expect(usersService.clearCache).toHaveBeenCalledWith('users-list');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and clear appropriate caches', async () => {
      usersService.deleteUser.mockResolvedValue(mockUser);

      const result = await usersController.deleteUser('1');
      expect(result).toEqual(mockUser);
      expect(usersService.deleteUser).toHaveBeenCalledWith({ id: '1' });
      expect(usersService.clearCache).toHaveBeenCalledWith('users:1');
      expect(usersService.clearCache).toHaveBeenCalledWith('users-list');
    });
  });
});
