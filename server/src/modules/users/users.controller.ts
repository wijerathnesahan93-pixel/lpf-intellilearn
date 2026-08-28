import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { UsersService } from './users.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

const usersService = new UsersService();

export class UsersController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req.query);
      const search = req.query.search as string;
      const { items, total } = await usersService.list(params, search);
      
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
      const user = await usersService.getById(req.params.id);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id, req.body);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
