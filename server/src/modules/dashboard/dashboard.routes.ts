import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { dashboardController } from './dashboard.controller';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => dashboardController.getDashboard(req as AuthRequest, res, next));

export default router;
