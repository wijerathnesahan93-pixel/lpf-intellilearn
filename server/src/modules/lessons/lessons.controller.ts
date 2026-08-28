import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { lessonsService } from './lessons.service';
import { buildPaginationMeta } from '../../utils/pagination';

export class LessonsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await lessonsService.findMany(req.query, req.user);
      res.json({
        data: result.data,
        meta: buildPaginationMeta(result.total, result.page, result.limit)
      });
    } catch (error) { next(error); }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await lessonsService.findById(req.params.id, req.user);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await lessonsService.create(req.body, req.user!.id);
      res.status(201).json({ data });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await lessonsService.update(req.params.id, req.body, req.user!.id, req.user!.role);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await lessonsService.delete(req.params.id, req.user!.id, req.user!.role);
      res.status(204).end();
    } catch (error) { next(error); }
  }
}
export const lessonsController = new LessonsController();
