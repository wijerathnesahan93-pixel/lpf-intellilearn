import apiClient from './client';
import { Enrollment, PaginatedResponse, ApiResponse } from '../types';

export const enrollmentsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Enrollment>> => {
    const response = await apiClient.get<PaginatedResponse<Enrollment>>('/enrollments', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Enrollment> => {
    const response = await apiClient.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Enrollment> => {
    const response = await apiClient.post<ApiResponse<Enrollment>>('/enrollments', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Enrollment> => {
    const response = await apiClient.put<ApiResponse<Enrollment>>(`/enrollments/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/enrollments/${id}`);
  },
};
