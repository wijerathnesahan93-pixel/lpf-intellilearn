import apiClient from './client';
import { Subject, PaginatedResponse, ApiResponse } from '../types';

export const subjectsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Subject>> => {
    const response = await apiClient.get<PaginatedResponse<Subject>>('/subjects', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Subject> => {
    const response = await apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Subject> => {
    const response = await apiClient.post<ApiResponse<Subject>>('/subjects', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Subject> => {
    const response = await apiClient.put<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`);
  },
};
