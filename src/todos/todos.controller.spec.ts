import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Todo } from '@prisma/client';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';

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

const mockTodosService = {
  todos: jest.fn(),
  todo: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  clearCache: jest.fn(),
};

describe('TodosController', () => {
  let todosController: TodosController;
  let todosService: typeof mockTodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        { provide: TodosService, useValue: mockTodosService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    todosController = module.get<TodosController>(TodosController);
    todosService = module.get(TodosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getTodos', () => {
    it('returns an array of todos', async () => {
      todosService.todos.mockResolvedValue([mockTodo]);

      const result = await todosController.getTodos();

      expect(result).toEqual([mockTodo]);
      expect(todosService.todos).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getTodo', () => {
    it('returns a single todo', async () => {
      todosService.todo.mockResolvedValue(mockTodo);

      const result = await todosController.getTodo('1');

      expect(result).toEqual(mockTodo);
      expect(todosService.todo).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('createTodo', () => {
    it('creates a todo and clears the list cache', async () => {
      const dto: CreateTodoDto = {
        title: 'Buy milk',
        description: 'Whole milk, 2 liters',
      };
      todosService.createTodo.mockResolvedValue(mockTodo);

      const result = await todosController.createTodo(dto);

      expect(result).toEqual(mockTodo);
      expect(todosService.createTodo).toHaveBeenCalledWith(dto);
      expect(todosService.clearCache).toHaveBeenCalledWith('todos-list');
    });
  });

  describe('updateTodo', () => {
    it('updates a todo and clears the affected caches', async () => {
      const dto: UpdateTodoDto = { completed: true };
      const updated = { ...mockTodo, completed: true };
      todosService.updateTodo.mockResolvedValue(updated);

      const result = await todosController.updateTodo('1', dto);

      expect(result).toEqual(updated);
      expect(todosService.updateTodo).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
      expect(todosService.clearCache).toHaveBeenCalledWith('todos:1');
      expect(todosService.clearCache).toHaveBeenCalledWith('todos-list');
    });
  });

  describe('deleteTodo', () => {
    it('deletes a todo and clears the affected caches', async () => {
      todosService.deleteTodo.mockResolvedValue(mockTodo);

      const result = await todosController.deleteTodo('1');

      expect(result).toEqual(mockTodo);
      expect(todosService.deleteTodo).toHaveBeenCalledWith({ id: '1' });
      expect(todosService.clearCache).toHaveBeenCalledWith('todos:1');
      expect(todosService.clearCache).toHaveBeenCalledWith('todos-list');
    });
  });
});
