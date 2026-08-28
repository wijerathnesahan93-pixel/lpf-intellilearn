import apiClient from './client';
import { Parent, PaginatedResponse, ApiResponse } from '../types';

export const parentsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Parent>> => {
    const response = await apiClient.get<PaginatedResponse<Parent>>('/parents', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Parent> => {
    const response = await apiClient.get<ApiResponse<Parent>>(`/parents/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Parent> => {
    const response = await apiClient.post<ApiResponse<Parent>>('/parents', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Parent> => {
    const response = await apiClient.put<ApiResponse<Parent>>(`/parents/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/parents/${id}`);
  },
};
