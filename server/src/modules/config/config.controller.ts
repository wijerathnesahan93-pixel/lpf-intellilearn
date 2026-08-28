import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { configService } from './config.service';

export class ConfigController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await configService.findAll();
      res.json({ data });
    } catch (error) { next(error); }
  }

  async getByKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await configService.findByKey(req.params.key);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await configService.create(req.body);
      res.status(201).json({ data });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await configService.update(req.params.key, req.body);
      res.json({ data });
    } catch (error) { next(error); }
  }
}
export const configController = new ConfigController();
