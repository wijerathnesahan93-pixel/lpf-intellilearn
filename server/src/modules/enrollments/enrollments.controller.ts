import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { enrollmentsService } from './enrollments.service';
import { buildPaginationMeta } from '../../utils/pagination';

export class EnrollmentsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentsService.findMany(req.query);
      res.json({
        data: result.data,
        meta: buildPaginationMeta(result.total, result.page, result.limit)
      });
    } catch (error) { next(error); }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await enrollmentsService.findById(req.params.id);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await enrollmentsService.create(req.body);
      res.status(201).json({ data });
    } catch (error) { next(error); }
  }

  async bulkEnroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await enrollmentsService.bulkEnroll(req.body);
      res.status(201).json({ data });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await enrollmentsService.delete(req.params.id);
      res.status(204).end();
    } catch (error) { next(error); }
  }
}
export const enrollmentsController = new EnrollmentsController();
