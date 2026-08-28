import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, id } = req.user!;
      let data;
      switch (role) {
        case 'ADMIN':
          data = await dashboardService.getAdminDashboard();
          break;
        case 'TEACHER':
          data = await dashboardService.getTeacherDashboard(id);
          break;
        case 'STUDENT':
          data = await dashboardService.getStudentDashboard(id);
          break;
        case 'PARENT':
          data = await dashboardService.getParentDashboard(id);
          break;
        default:
          return res.status(403).json({ message: 'Invalid role' });
      }
      res.json({ data });
    } catch (error) { next(error); }
  }
}
export const dashboardController = new DashboardController();
