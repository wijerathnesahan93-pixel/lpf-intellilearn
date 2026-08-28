import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { StudentsService } from './students.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

const studentsService = new StudentsService();

export class StudentsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const search = req.query.search as string;
      const { items, total } = await studentsService.list(params, search);
      
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
      const student = await studentsService.getById(req.params.id);
      res.json({ data: student });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await studentsService.create(req.body);
      res.status(201).json({ data: student });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await studentsService.update(req.params.id, req.body);
      res.json({ data: student });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await studentsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
