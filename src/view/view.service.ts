import { Injectable, OnModuleInit } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import next from 'next';
import { NextServer } from 'next/dist/server/next';
import { join } from 'path';

@Injectable()
export class ViewService implements OnModuleInit {
  private nextServer: NextServer;

  async onModuleInit() {
    const dev = process.env.NODE_ENV !== 'production';
    this.nextServer = next({
      dev,
      dir: join(process.cwd(), 'client'),
    });
    await this.nextServer.prepare();
  }

  getNextServer(): NextServer {
    return this.nextServer;
  }

  async handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const handle = this.nextServer.getRequestHandler();
    await handle(req, res);
  }
}
