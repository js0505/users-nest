import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// NestMiddleware 인터페이스를 구현한 클래스로
// 미들웨어 생성가능.
@Injectable()
export class LoggerMiddelware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('request...');
    next();
  }
}
