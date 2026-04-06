import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ViewService } from './view.service';

@Controller()
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @Get('_next/*')
  async nextAssets(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.viewService.handler(req, res);
  }

  @Get('__nextjs*')
  async nextInternal(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.viewService.handler(req, res);
  }
}
