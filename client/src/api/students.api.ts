import apiClient from './client';
import { Student, PaginatedResponse, ApiResponse } from '../types';

export const studentsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<PaginatedResponse<Student>>('/students', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<Student>>('/students', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Student> => {
    const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
};
