import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upload } from '../../middleware/upload.middleware';
import { materialsController } from './materials.controller';
import { createMaterialSchema, updateMaterialSchema } from './materials.validation';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => materialsController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => materialsController.get(req as AuthRequest, res, next));

router.use(authorize('ADMIN', 'TEACHER'));
router.post('/', upload.single('file'), validate(createMaterialSchema), (req, res, next) => materialsController.create(req as AuthRequest, res, next));
router.put('/:id', upload.single('file'), validate(updateMaterialSchema), (req, res, next) => materialsController.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => materialsController.delete(req as AuthRequest, res, next));

export default router;
