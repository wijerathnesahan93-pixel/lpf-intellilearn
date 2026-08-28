import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { ParentsService } from './parents.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

const parentsService = new ParentsService();

export class ParentsController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const search = req.query.search as string;
      const { items, total } = await parentsService.list(params, search);
      
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
      const parent = await parentsService.getById(req.params.id);
      res.json({ data: parent });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parent = await parentsService.create(req.body);
      res.status(201).json({ data: parent });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parent = await parentsService.update(req.params.id, req.body);
      res.json({ data: parent });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await parentsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async linkChild(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await parentsService.linkChild(req.params.id, req.body.studentId, req.body.relationship);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }

  async unlinkChild(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await parentsService.unlinkChild(req.params.id, req.params.studentId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getChildren(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new Error('User ID not found in request');
      const children = await parentsService.getChildrenByUser(req.user!.id);
      res.json({ data: children });
    } catch (error) {
      next(error);
    }
  }
}
