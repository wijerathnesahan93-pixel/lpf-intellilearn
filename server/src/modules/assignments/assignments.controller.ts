import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { assignmentService } from './assignments.service';
import { parsePagination } from '../../utils/pagination';

export class AssignmentController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const role = req.user!.role;
      let teacherId, studentId;
      
      if (role === 'TEACHER') teacherId = req.user!.id;
      if (role === 'STUDENT') studentId = req.user!.id;
      
      const result = await assignmentService.list({ ...params, role, teacherId, studentId });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assignmentService.getById(req.params.id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assignmentService.create(req.body, req.user!.id);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assignmentService.update(req.params.id, req.body, req.user!.id, req.user!.role);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await assignmentService.delete(req.params.id, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  
  async getSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const result = await assignmentService.getSubmissions(req.params.id, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async submitAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assignmentService.submitAssignment(req.params.id, req.user!.id, req.body.content);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async reviewSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await assignmentService.reviewSubmission(req.params.submissionId, req.user!.id, req.body);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
  
  async getMySubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const result = await assignmentService.getMySubmissions(req.user!.id, params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const assignmentController = new AssignmentController();
