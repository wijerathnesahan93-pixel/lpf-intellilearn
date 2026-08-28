import apiClient from './client';
import { SystemConfig, PaginatedResponse, ApiResponse } from '../types';

export const systemConfigApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<SystemConfig>> => {
    const response = await apiClient.get<PaginatedResponse<SystemConfig>>('/system-configs', { params });
    return response.data;
  },
  getByKey: async (key: string): Promise<SystemConfig> => {
    const response = await apiClient.get<ApiResponse<SystemConfig>>(`/system-configs/${key}`);
    return response.data.data;
  },
  create: async (data: any): Promise<SystemConfig> => {
    const response = await apiClient.post<ApiResponse<SystemConfig>>('/system-configs', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<SystemConfig> => {
    const response = await apiClient.put<ApiResponse<SystemConfig>>(`/system-configs/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/system-configs/${id}`);
  },
};
