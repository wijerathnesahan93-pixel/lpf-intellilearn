import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { gradesService } from './grades.service';

export class GradesController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await gradesService.list();
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await gradesService.getById(req.params.id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await gradesService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await gradesService.update(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await gradesService.delete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const gradesController = new GradesController();
