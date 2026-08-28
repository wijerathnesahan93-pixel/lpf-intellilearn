import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ClassesService } from './classes.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

const classesService = new ClassesService();

export class ClassesController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const search = req.query.search as string;
      const { items, total } = await classesService.list(params, search);
      
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
      const cls = await classesService.getById(req.params.id);
      res.json({ data: cls });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cls = await classesService.create(req.body);
      res.status(201).json({ data: cls });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cls = await classesService.update(req.params.id, req.body);
      res.json({ data: cls });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await classesService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async listSubjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await classesService.listSubjects(req.params.classId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async addSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.body;
      if (!subjectId) {
        return res.status(400).json({ error: 'subjectId is required' });
      }
      const data = await classesService.addSubject(req.params.classId, subjectId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async removeSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await classesService.removeSubject(req.params.classId, req.params.subjectId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
