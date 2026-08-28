import apiClient from './client';
import { Class, PaginatedResponse, ApiResponse } from '../types';

export const classesApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Class>> => {
    const response = await apiClient.get<PaginatedResponse<Class>>('/classes', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Class> => {
    const response = await apiClient.get<ApiResponse<Class>>(`/classes/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Class> => {
    const response = await apiClient.post<ApiResponse<Class>>('/classes', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Class> => {
    const response = await apiClient.put<ApiResponse<Class>>(`/classes/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/classes/${id}`);
  },
};
