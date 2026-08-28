import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class ConfigService {
  async findAll() {
    return prisma.systemConfig.findMany();
  }

  async findByKey(key: string) {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (!config) throw new NotFoundError('Config not found');
    return config;
  }

  async create(data: { key: string; value: string; description?: string }) {
    return prisma.systemConfig.create({ data });
  }

  async update(key: string, data: { value: string; description?: string }) {
    return prisma.systemConfig.update({ where: { key }, data });
  }
}
export const configService = new ConfigService();
