import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { CoursesService } from './courses.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

const coursesService = new CoursesService();

export class CoursesController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const search = req.query.search as string;
      const { items, total } = await coursesService.list(params, search);
      
      res.json({
        data: items,
        meta: buildPaginationMeta(total, params),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await coursesService.getById(req.params.id);
      res.json({ data: course });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await coursesService.create(req.body);
      res.status(201).json({ data: course });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await coursesService.update(req.params.id, req.body);
      res.json({ data: course });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await coursesService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
