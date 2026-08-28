import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { studentRegistrationsService } from './student-registrations.service';

export class StudentRegistrationsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await studentRegistrationsService.list({ page, limit, status });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await studentRegistrationsService.getById(req.params.id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { classId } = req.body;
      const result = await studentRegistrationsService.approve(req.params.id, classId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await studentRegistrationsService.reject(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const studentRegistrationsController = new StudentRegistrationsController();
