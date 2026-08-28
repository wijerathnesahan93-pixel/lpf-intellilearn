import prisma from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export class MaterialsService {
  async findMany(query: any, user: any) {
    const { page = 1, limit = 10, subjectId, topicId, type } = query;
    const skip = (page - 1) * limit;
    
    let where: any = {};
    if (subjectId) where.subjectId = String(subjectId);
    if (topicId) where.topicId = String(topicId);
    if (type) where.type = String(type);

    if (user.role === 'STUDENT') {
      where.isPublished = true;
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) {
        where.subject = {
          enrollments: { some: { studentId: student.id } }
        };
      }
    }
    
    const [data, total] = await Promise.all([
      prisma.learningMaterial.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: { 
          subject: true, 
          topic: true,
          teacher: { include: { user: { select: { firstName: true, lastName: true } } } }
        }
      }),
      prisma.learningMaterial.count({ where })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string, user: any) {
    const material = await prisma.learningMaterial.findUnique({
      where: { id },
      include: { 
        subject: true, 
        topic: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } }
      }
    });
    if (!material) throw new NotFoundError('Material not found');
    if (user.role === 'STUDENT' && !material.isPublished) throw new ForbiddenError('Material not published');
    
    return material;
  }

  async create(data: any, file: any, userId: string) {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new ForbiddenError('Only teachers can create materials');
    
    const fileUrl = file ? `/uploads/${file.filename}` : '';
    const fileData = {
      fileUrl,
      fileName: file ? file.originalname : '',
      fileSize: file ? file.size : 0,
    };
    
    return prisma.learningMaterial.create({ 
      data: { ...data, ...fileData, teacherId: teacher.id } 
    });
  }

  async update(id: string, data: any, file: any, userId: string, role: string) {
    const material = await prisma.learningMaterial.findUnique({ where: { id } });
    if (!material) throw new NotFoundError('Material not found');

    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || material.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator or admin can update this material');
      }
    }

    const updateData = { ...data };
    if (file) {
      updateData.fileUrl = `/uploads/${file.filename}`;
      updateData.fileName = file.originalname;
      updateData.fileSize = file.size;
    }
    return prisma.learningMaterial.update({ where: { id }, data: updateData });
  }

  async delete(id: string, userId: string, role: string) {
    const material = await prisma.learningMaterial.findUnique({ where: { id } });
    if (!material) throw new NotFoundError('Material not found');

    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || material.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator or admin can delete this material');
      }
    }

    return prisma.learningMaterial.delete({ where: { id } });
  }
}
export const materialsService = new MaterialsService();
