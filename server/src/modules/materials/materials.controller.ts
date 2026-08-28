import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { materialsService } from './materials.service';
import { buildPaginationMeta } from '../../utils/pagination';

export class MaterialsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await materialsService.findMany(req.query, req.user);
      res.json({
        data: result.data,
        meta: buildPaginationMeta(result.total, result.page, result.limit)
      });
    } catch (error) { next(error); }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await materialsService.findById(req.params.id, req.user);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await materialsService.create(req.body, req.file, req.user!.id);
      res.status(201).json({ data });
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await materialsService.update(req.params.id, req.body, req.file);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await materialsService.delete(req.params.id);
      res.status(204).end();
    } catch (error) { next(error); }
  }
}
export const materialsController = new MaterialsController();
