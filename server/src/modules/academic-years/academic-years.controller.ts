import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { AcademicYearsService } from './academic-years.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

const academicYearsService = new AcademicYearsService();

export class AcademicYearsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const search = req.query.search as string;
      const { items, total } = await academicYearsService.list(params, search);
      
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
      const year = await academicYearsService.getById(req.params.id);
      res.json({ data: year });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = await academicYearsService.create(req.body);
      res.status(201).json({ data: year });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const year = await academicYearsService.update(req.params.id, req.body);
      res.json({ data: year });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await academicYearsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
