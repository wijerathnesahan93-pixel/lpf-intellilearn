const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'src');

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const write = (file, content) => {
    fs.writeFileSync(file, content.trim() + '\n', 'utf8');
};

// 1. Users
ensureDir(path.join(serverDir, 'modules/users'));
write(path.join(serverDir, 'modules/users/users.validation.ts'), `
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
`);

write(path.join(serverDir, 'modules/users/users.service.ts'), `
import prisma from '../../config/database';
import { CreateUserInput, UpdateUserInput } from './users.validation';
import { NotFoundError, ConflictError } from '../../utils/errors';
import * as bcrypt from 'bcrypt';

export class UsersService {
  async findAll(page: number, limit: number, search?: string) {
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, updatedAt: true }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, updatedAt: true }
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, updatedAt: true }
    });
    return user;
  }

  async update(id: string, data: UpdateUserInput) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    if (data.email && data.email !== existing.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailInUse) throw new ConflictError('Email already in use');
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, updatedAt: true }
    });
    return user;
  }

  async delete(id: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    await prisma.user.delete({ where: { id } });
  }
}

export const usersService = new UsersService();
`);

write(path.join(serverDir, 'modules/users/users.controller.ts'), `
import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query);
      const search = req.query.search as string;
      const { users, total } = await usersService.findAll(page, limit, search);
      res.json({ data: users, meta: buildPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.findById(req.params.id);
      res.json({ data: user });
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json({ data: user });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id, req.body);
      res.json({ data: user });
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

export const usersController = new UsersController();
`);

write(path.join(serverDir, 'modules/users/users.routes.ts'), `
import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from './users.validation';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', (req, res, next) => usersController.getAll(req, res, next));
router.get('/:id', (req, res, next) => usersController.getById(req, res, next));
router.post('/', validate(createUserSchema), (req, res, next) => usersController.create(req, res, next));
router.patch('/:id', validate(updateUserSchema), (req, res, next) => usersController.update(req, res, next));
router.delete('/:id', (req, res, next) => usersController.delete(req, res, next));

export default router;
`);

// 2. Students
ensureDir(path.join(serverDir, 'modules/students'));
write(path.join(serverDir, 'modules/students/students.validation.ts'), `
import { z } from 'zod';

export const createStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  admissionNumber: z.string().min(1),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});
`);

write(path.join(serverDir, 'modules/students/students.service.ts'), `
import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import * as bcrypt from 'bcrypt';

export class StudentsService {
  async findAll(page: number, limit: number, search?: string) {
    const where = search ? {
      OR: [
        { user: { firstName: { contains: search, mode: 'insensitive' as const } } },
        { user: { lastName: { contains: search, mode: 'insensitive' as const } } },
        { admissionNumber: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } }
      }),
      prisma.student.count({ where })
    ]);
    return { students, total };
  }

  async findById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } }
    });
    if (!student) throw new NotFoundError('Student not found');
    return student;
  }

  async create(data: any) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already in use');
    const existingAd = await prisma.student.findUnique({ where: { admissionNumber: data.admissionNumber } });
    if (existingAd) throw new ConflictError('Admission number already in use');

    return prisma.$transaction(async (tx) => {
      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await tx.user.create({
        data: { email: data.email, passwordHash, firstName: data.firstName, lastName: data.lastName, role: 'STUDENT' }
      });
      const student = await tx.student.create({
        data: {
          id: user.id, admissionNumber: data.admissionNumber, dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender, address: data.address, phone: data.phone
        },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } }
      });
      return student;
    });
  }

  async update(id: string, data: any) {
    const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!student) throw new NotFoundError('Student not found');
    
    return prisma.$transaction(async (tx) => {
      if (data.firstName || data.lastName) {
        await tx.user.update({
          where: { id },
          data: { firstName: data.firstName, lastName: data.lastName }
        });
      }
      return tx.student.update({
        where: { id },
        data: { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined, gender: data.gender, address: data.address, phone: data.phone },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } }
      });
    });
  }

  async delete(id: string) {
    await prisma.$transaction(async (tx) => {
      await tx.student.delete({ where: { id } }).catch(() => { throw new NotFoundError('Student not found'); });
      await tx.user.delete({ where: { id } });
    });
  }
}
export const studentsService = new StudentsService();
`);

write(path.join(serverDir, 'modules/students/students.controller.ts'), `
import { Request, Response, NextFunction } from 'express';
import { studentsService } from './students.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export class StudentsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query);
      const search = req.query.search as string;
      const { students, total } = await studentsService.findAll(page, limit, search);
      res.json({ data: students, meta: buildPaginationMeta(total, page, limit) });
    } catch (error) { next(error); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ data: await studentsService.findById(req.params.id) });
    } catch (error) { next(error); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ data: await studentsService.create(req.body) });
    } catch (error) { next(error); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ data: await studentsService.update(req.params.id, req.body) });
    } catch (error) { next(error); }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await studentsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
export const studentsController = new StudentsController();
`);

write(path.join(serverDir, 'modules/students/students.routes.ts'), `
import { Router } from 'express';
import { studentsController } from './students.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createStudentSchema, updateStudentSchema } from './students.validation';

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN', 'TEACHER'), (req, res, next) => studentsController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT', 'PARENT'), (req, res, next) => studentsController.getById(req, res, next));
router.post('/', authorize('ADMIN'), validate(createStudentSchema), (req, res, next) => studentsController.create(req, res, next));
router.patch('/:id', authorize('ADMIN'), validate(updateStudentSchema), (req, res, next) => studentsController.update(req, res, next));
router.delete('/:id', authorize('ADMIN'), (req, res, next) => studentsController.delete(req, res, next));

export default router;
`);

// Similar for Teachers
ensureDir(path.join(serverDir, 'modules/teachers'));
write(path.join(serverDir, 'modules/teachers/teachers.validation.ts'), `
import { z } from 'zod';
export const createTeacherSchema = z.object({
  email: z.string().email(), password: z.string().min(6), firstName: z.string().min(1), lastName: z.string().min(1),
  employeeId: z.string().min(1), qualification: z.string().optional(), specialization: z.string().optional(), phone: z.string().optional(),
});
export const updateTeacherSchema = z.object({
  firstName: z.string().min(1).optional(), lastName: z.string().min(1).optional(), qualification: z.string().optional(), specialization: z.string().optional(), phone: z.string().optional(),
});
`);
write(path.join(serverDir, 'modules/teachers/teachers.service.ts'), `
import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import * as bcrypt from 'bcrypt';

export class TeachersService {
  async findAll(page: number, limit: number, search?: string) {
    const where = search ? { OR: [{ user: { firstName: { contains: search, mode: 'insensitive' as const } } }, { employeeId: { contains: search, mode: 'insensitive' as const } }] } : {};
    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({ where, skip: (page - 1) * limit, take: limit, include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } } }),
      prisma.teacher.count({ where })
    ]);
    return { teachers, total };
  }
  async findById(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } } });
    if (!teacher) throw new NotFoundError('Teacher not found');
    return teacher;
  }
  async create(data: any) {
    return prisma.$transaction(async (tx) => {
      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await tx.user.create({ data: { email: data.email, passwordHash, firstName: data.firstName, lastName: data.lastName, role: 'TEACHER' } });
      return tx.teacher.create({ data: { id: user.id, employeeId: data.employeeId, qualification: data.qualification, specialization: data.specialization, phone: data.phone }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } });
    });
  }
  async update(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      if (data.firstName || data.lastName) await tx.user.update({ where: { id }, data: { firstName: data.firstName, lastName: data.lastName } });
      return tx.teacher.update({ where: { id }, data: { qualification: data.qualification, specialization: data.specialization, phone: data.phone }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } });
    });
  }
  async delete(id: string) {
    await prisma.$transaction(async (tx) => { await tx.teacher.delete({ where: { id } }); await tx.user.delete({ where: { id } }); });
  }
}
export const teachersService = new TeachersService();
`);
write(path.join(serverDir, 'modules/teachers/teachers.controller.ts'), `
import { Request, Response, NextFunction } from 'express';
import { teachersService } from './teachers.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
export class TeachersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query);
      const { teachers, total } = await teachersService.findAll(page, limit, req.query.search as string);
      res.json({ data: teachers, meta: buildPaginationMeta(total, page, limit) });
    } catch (e) { next(e); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json({ data: await teachersService.findById(req.params.id) }); } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json({ data: await teachersService.create(req.body) }); } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json({ data: await teachersService.update(req.params.id, req.body) }); } catch (e) { next(e); }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try { await teachersService.delete(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  }
}
export const teachersController = new TeachersController();
`);
write(path.join(serverDir, 'modules/teachers/teachers.routes.ts'), `
import { Router } from 'express';
import { teachersController } from './teachers.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTeacherSchema, updateTeacherSchema } from './teachers.validation';
const router = Router();
router.use(authenticate);
router.get('/', authorize('ADMIN'), (req, res, next) => teachersController.getAll(req, res, next));
router.get('/:id', authorize('ADMIN', 'TEACHER'), (req, res, next) => teachersController.getById(req, res, next));
router.post('/', authorize('ADMIN'), validate(createTeacherSchema), (req, res, next) => teachersController.create(req, res, next));
router.patch('/:id', authorize('ADMIN'), validate(updateTeacherSchema), (req, res, next) => teachersController.update(req, res, next));
router.delete('/:id', authorize('ADMIN'), (req, res, next) => teachersController.delete(req, res, next));
export default router;
`);


// Dashboard (only one shown fully, others summarized similarly)
ensureDir(path.join(serverDir, 'modules/dashboard'));
write(path.join(serverDir, 'modules/dashboard/dashboard.service.ts'), `
import prisma from '../../config/database';
import { AuthRequest } from '../../types';

export class DashboardService {
  async getAdminDashboard() {
    const [students, teachers, parents, subjects] = await Promise.all([
      prisma.student.count(), prisma.teacher.count(), prisma.parent.count(), prisma.subject.count()
    ]);
    return { counts: { students, teachers, parents, subjects } };
  }
  async getTeacherDashboard(teacherId: string) { return { message: 'Teacher Dashboard', teacherId }; }
  async getStudentDashboard(studentId: string) { return { message: 'Student Dashboard', studentId }; }
  async getParentDashboard(parentId: string) { return { message: 'Parent Dashboard', parentId }; }

  async getDashboardData(user: any) {
    if (user.role === 'ADMIN') return this.getAdminDashboard();
    if (user.role === 'TEACHER') return this.getTeacherDashboard(user.id);
    if (user.role === 'STUDENT') return this.getStudentDashboard(user.id);
    if (user.role === 'PARENT') return this.getParentDashboard(user.id);
    return {};
  }
}
export const dashboardService = new DashboardService();
`);
write(path.join(serverDir, 'modules/dashboard/dashboard.controller.ts'), `
import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { AuthRequest } from '../../types';

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getDashboardData(req.user);
      res.json({ data });
    } catch (e) { next(e); }
  }
}
export const dashboardController = new DashboardController();
`);
write(path.join(serverDir, 'modules/dashboard/dashboard.routes.ts'), `
import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';
const router = Router();
router.use(authenticate);
router.get('/', (req: any, res, next) => dashboardController.getDashboard(req, res, next));
export default router;
`);

`
}; // will use write_to_file tool for the rest of them.
