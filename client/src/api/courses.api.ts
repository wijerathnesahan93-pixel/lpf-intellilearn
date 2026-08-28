import apiClient from './client';
import { Course, PaginatedResponse, ApiResponse } from '../types';

export const coursesApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<PaginatedResponse<Course>>('/courses', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Course> => {
    const response = await apiClient.post<ApiResponse<Course>>('/courses', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Course> => {
    const response = await apiClient.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },
};
