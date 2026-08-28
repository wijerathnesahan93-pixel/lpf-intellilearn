import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const studentRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  address: z.string().optional().nullable(),
  gradeNumber: z.number().int().min(1).max(13),
  classSection: z.string().optional().default('A'),
  parentName: z.string().min(1, 'Parent/Guardian name is required'),
  parentEmail: z.string().email('Invalid parent email address'),
  parentPhone: z.string().optional().nullable(),
  relationship: z.string().optional().default('Parent'),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
