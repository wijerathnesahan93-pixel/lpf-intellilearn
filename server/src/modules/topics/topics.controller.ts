import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { topicsService } from './topics.service';
import { buildPaginationMeta } from '../../utils/pagination';

export class TopicsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await topicsService.findMany(req.query);
      res.json({
        data: result.data,
        meta: buildPaginationMeta(result.total, result.page, result.limit)
      });
    } catch (error) { next(error); }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await topicsService.findById(req.params.id);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await topicsService.create(req.body);
      res.status(201).json({ data });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await topicsService.update(req.params.id, req.body);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await topicsService.delete(req.params.id);
      res.status(204).end();
    } catch (error) { next(error); }
  }
}
export const topicsController = new TopicsController();
