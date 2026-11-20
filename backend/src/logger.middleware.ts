import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Solo la ruta, sin la query: así no quedan tokens (ej. ?token=...) en los logs
    console.log(`${req.method} ${req.originalUrl.split('?')[0]}`);
    next();
  }
}
