import apiClient from './client';
import { Lesson, PaginatedResponse, ApiResponse } from '../types';

export const lessonsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Lesson>> => {
    const response = await apiClient.get<PaginatedResponse<Lesson>>('/lessons', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Lesson> => {
    const response = await apiClient.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Lesson> => {
    const response = await apiClient.post<ApiResponse<Lesson>>('/lessons', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Lesson> => {
    const response = await apiClient.put<ApiResponse<Lesson>>(`/lessons/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lessons/${id}`);
  },
};
