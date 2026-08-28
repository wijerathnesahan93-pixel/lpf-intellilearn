import { Router } from 'express';
import { ClassesController } from './classes.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createClassSchema, updateClassSchema } from './classes.validation';
import { AuthRequest } from '../../types';

const router = Router();
const controller = new ClassesController();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', (req, res, next) => controller.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => controller.getById(req as AuthRequest, res, next));
router.post('/', validate(createClassSchema), (req, res, next) => controller.create(req as AuthRequest, res, next));
router.put('/:id', validate(updateClassSchema), (req, res, next) => controller.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req as AuthRequest, res, next));

router.get('/:classId/subjects', (req, res, next) => controller.listSubjects(req as AuthRequest, res, next));
router.post('/:classId/subjects', (req, res, next) => controller.addSubject(req as AuthRequest, res, next));
router.delete('/:classId/subjects/:subjectId', (req, res, next) => controller.removeSubject(req as AuthRequest, res, next));

export default router;
