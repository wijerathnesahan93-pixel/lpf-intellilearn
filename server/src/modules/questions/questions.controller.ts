import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { questionService } from './questions.service';
import { parsePagination } from '../../utils/pagination';

export class QuestionController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const role = req.user!.role;
      let teacherId;
      
      if (role === 'TEACHER') teacherId = req.user!.id;
      
      const filters = {
        subjectId: req.query.subjectId as string,
        topicId: req.query.topicId as string,
        type: req.query.type as string,
        difficulty: req.query.difficulty as string
      };
      
      const result = await questionService.list({ ...params, ...filters, role, teacherId });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await questionService.getById(req.params.id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await questionService.create(req.body, req.user!.id);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await questionService.update(req.params.id, req.body, req.user!.id, req.user!.role);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await questionService.delete(req.params.id, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const questionController = new QuestionController();
