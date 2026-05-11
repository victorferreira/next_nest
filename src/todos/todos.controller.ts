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
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Todo } from '@prisma/client';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';

@Controller('api/todos')
@UseInterceptors(CacheInterceptor)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @CacheKey('todos-list')
  @CacheTTL(120)
  async getTodos(): Promise<Todo[]> {
    return this.todosService.todos({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  @CacheTTL(300)
  async getTodo(@Param('id') id: string): Promise<Todo | null> {
    return this.todosService.todo({ id });
  }

  @Post()
  async createTodo(@Body() todoInput: CreateTodoDto): Promise<Todo> {
    const todo = await this.todosService.createTodo(todoInput);
    await this.todosService.clearCache('todos-list');
    return todo;
  }

  @Put(':id')
  async updateTodo(
    @Param('id') id: string,
    @Body() todoInput: UpdateTodoDto,
  ): Promise<Todo> {
    const todo = await this.todosService.updateTodo({
      where: { id },
      data: todoInput,
    });
    await this.todosService.clearCache(`todos:${id}`);
    await this.todosService.clearCache('todos-list');
    return todo;
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: string): Promise<Todo> {
    const deleted = await this.todosService.deleteTodo({ id });
    await this.todosService.clearCache(`todos:${id}`);
    await this.todosService.clearCache('todos-list');
    return deleted;
  }
}
