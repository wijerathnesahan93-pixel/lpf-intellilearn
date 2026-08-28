import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { authService } from './auth.service';

export class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async registerStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.registerStudent(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
