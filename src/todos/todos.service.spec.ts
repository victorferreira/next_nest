import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Todo } from '@prisma/client';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma.service';

const mockPrismaService = {
  todo: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockTodo: Todo = {
  id: '1',
  title: 'Buy milk',
  description: 'Whole milk, 2 liters',
  completed: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('TodosService', () => {
  let todosService: TodosService;
  let prisma: typeof mockPrismaService;
  let cache: typeof mockCacheManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    todosService = module.get<TodosService>(TodosService);
    prisma = module.get(PrismaService);
    cache = module.get(CACHE_MANAGER);
  });

  afterEach(() => jest.clearAllMocks());

  describe('todo', () => {
    it('returns cached todo when available', async () => {
      cache.get.mockResolvedValue(mockTodo);

      const result = await todosService.todo({ id: '1' });

      expect(result).toEqual(mockTodo);
      expect(cache.get).toHaveBeenCalledWith('todos:1');
      expect(prisma.todo.findUnique).not.toHaveBeenCalled();
    });

    it('falls back to prisma and caches the result on miss', async () => {
      cache.get.mockResolvedValue(undefined);
      prisma.todo.findUnique.mockResolvedValue(mockTodo);

      const result = await todosService.todo({ id: '1' });

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(cache.set).toHaveBeenCalledWith('todos:1', mockTodo, 300);
    });
  });

  describe('todos', () => {
    it('delegates to prisma.todo.findMany with provided params', async () => {
      prisma.todo.findMany.mockResolvedValue([mockTodo]);

      const result = await todosService.todos({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual([mockTodo]);
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        cursor: undefined,
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('createTodo', () => {
    it('creates a todo via prisma', async () => {
      const data = { title: 'Buy milk', description: 'Whole milk' };
      prisma.todo.create.mockResolvedValue(mockTodo);

      const result = await todosService.createTodo(data);

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('updateTodo', () => {
    it('updates a todo via prisma', async () => {
      const updated = { ...mockTodo, completed: true };
      prisma.todo.update.mockResolvedValue(updated);

      const result = await todosService.updateTodo({
        where: { id: '1' },
        data: { completed: true },
      });

      expect(result).toEqual(updated);
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { completed: true },
      });
    });
  });

  describe('deleteTodo', () => {
    it('deletes a todo via prisma', async () => {
      prisma.todo.delete.mockResolvedValue(mockTodo);

      const result = await todosService.deleteTodo({ id: '1' });

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('clearCache', () => {
    it('forwards to cache manager del', async () => {
      await todosService.clearCache('todos-list');
      expect(cache.del).toHaveBeenCalledWith('todos-list');
    });
  });
});
