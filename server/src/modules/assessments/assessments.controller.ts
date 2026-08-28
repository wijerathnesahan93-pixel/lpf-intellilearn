import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { assessmentService } from './assessments.service';
import { parsePagination } from '../../utils/pagination';

export class AssessmentController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const role = req.user!.role;
      let teacherId, studentId;
      
      if (role === 'TEACHER') teacherId = req.user!.id;
      if (role === 'STUDENT') studentId = req.user!.id;
      
      const result = await assessmentService.list({ ...params, role, teacherId, studentId });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assessmentService.getById(req.params.id, req.user!.role);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assessmentService.create(req.body, req.user!.id);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assessmentService.update(req.params.id, req.body, req.user!.id, req.user!.role);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await assessmentService.delete(req.params.id, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  
  async startAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assessmentService.startAttempt(req.params.id, req.user!.id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async submitAttempt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assessmentService.submitAttempt(req.params.id, req.user!.id, req.body);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async getAttempts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assessmentService.getAttempts(req.params.id, req.user!.id, req.user!.role);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async getResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Actually gets a specific result by attempt ID (passed in :id but mapped in route)
      const result = await assessmentService.getResult(req.params.id, req.user!.id, req.user!.role);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const assessmentController = new AssessmentController();
