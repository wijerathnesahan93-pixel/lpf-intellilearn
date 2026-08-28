import apiClient from './client';
import { Teacher, PaginatedResponse, ApiResponse } from '../types';

export const teachersApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Teacher>> => {
    const response = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Teacher> => {
    const response = await apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Teacher> => {
    const response = await apiClient.post<ApiResponse<Teacher>>('/teachers', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Teacher> => {
    const response = await apiClient.put<ApiResponse<Teacher>>(`/teachers/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },
};
