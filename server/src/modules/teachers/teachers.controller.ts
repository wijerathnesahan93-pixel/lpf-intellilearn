import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { TeachersService } from './teachers.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

const teachersService = new TeachersService();

export class TeachersController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const search = req.query.search as string;
      const { items, total } = await teachersService.list(params, search);
      
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
      const teacher = await teachersService.getById(req.params.id);
      res.json({ data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacher = await teachersService.create(req.body);
      res.status(201).json({ data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacher = await teachersService.update(req.params.id, req.body);
      res.json({ data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await teachersService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
