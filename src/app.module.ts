import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { TodosController } from './todos/todos.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { UsersService } from './users/users.service';
import { TodosService } from './todos/todos.service';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { ViewModule } from './view/view.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      ttl: 60,
    }),
    ViewModule,
  ],
  controllers: [AppController, UsersController, TodosController],
  providers: [AppService, PrismaService, UsersService, TodosService],
})
export class AppModule {}
