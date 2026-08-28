import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { teacherAssignmentsService } from './teacher-assignments.service';
import { buildPaginationMeta } from '../../utils/pagination';

export class TeacherAssignmentsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await teacherAssignmentsService.findMany(req.query);
      res.json({
        data: result.data,
        meta: buildPaginationMeta(result.total, result.page, result.limit)
      });
    } catch (error) { next(error); }
  }

  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await teacherAssignmentsService.findById(req.params.id);
      res.json({ data });
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await teacherAssignmentsService.create(req.body);
      res.status(201).json({ data });
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await teacherAssignmentsService.delete(req.params.id);
      res.status(204).end();
    } catch (error) { next(error); }
  }
}
export const teacherAssignmentsController = new TeacherAssignmentsController();
