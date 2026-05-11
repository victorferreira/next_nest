import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma, Todo } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TodosService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async todo(
    todoWhereUniqueInput: Prisma.TodoWhereUniqueInput,
  ): Promise<Todo | null> {
    const cacheKey = `todos:${todoWhereUniqueInput.id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached as Todo;

    const todo = await this.prisma.todo.findUnique({
      where: todoWhereUniqueInput,
    });
    await this.cacheManager.set(cacheKey, todo, 300);
    return todo;
  }

  async todos(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TodoWhereUniqueInput;
    where?: Prisma.TodoWhereInput;
    orderBy?: Prisma.TodoOrderByWithRelationInput;
  }): Promise<Todo[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.todo.findMany({ skip, take, cursor, where, orderBy });
  }

  async createTodo(data: Prisma.TodoCreateInput): Promise<Todo> {
    return this.prisma.todo.create({ data });
  }

  async updateTodo(params: {
    where: Prisma.TodoWhereUniqueInput;
    data: Prisma.TodoUpdateInput;
  }): Promise<Todo> {
    const { where, data } = params;
    return this.prisma.todo.update({ where, data });
  }

  async deleteTodo(where: Prisma.TodoWhereUniqueInput): Promise<Todo> {
    return this.prisma.todo.delete({ where });
  }

  async clearCache(key: string) {
    await this.cacheManager.del(key);
  }
}
