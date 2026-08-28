import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { config } from '../../config';
import { AuthUser } from '../../types';
import { UnauthorizedError, NotFoundError, ConflictError } from '../../utils/errors';
import { LoginInput, StudentRegisterInput } from './auth.validation';

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'PENDING') {
      throw new UnauthorizedError('Your registration is pending administrator approval.');
    } else if (user.status === 'REJECTED') {
      throw new UnauthorizedError('Your registration has been rejected by the administrator.');
    } else if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Your account has been suspended.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = jwt.sign(authUser, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const accessToken = jwt.sign(authUser, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions);

      return { accessToken };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        student: true,
        teacher: true,
        parent: {
          include: {
            children: {
              include: {
                student: {
                  include: {
                    user: {
                      select: { firstName: true, lastName: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async registerStudent(input: StudentRegisterInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) throw new ConflictError('Email is already registered');

    const existingReg = await prisma.studentRegistration.findFirst({
      where: { email: input.email, status: 'PENDING' }
    });
    if (existingReg) throw new ConflictError('A registration with this email is already pending approval');

    const passwordHash = await bcrypt.hash(input.password, 10);

    return prisma.studentRegistration.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        phone: input.phone,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        gender: input.gender,
        address: input.address,
        gradeNumber: input.gradeNumber,
        classSection: input.classSection,
        parentName: input.parentName,
        parentEmail: input.parentEmail,
        parentPhone: input.parentPhone,
        relationship: input.relationship || 'Parent',
        status: 'PENDING'
      }
    });
  }
}

export const authService = new AuthService();
