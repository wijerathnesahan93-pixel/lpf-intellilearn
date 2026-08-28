import apiClient from './client';
import { Topic, PaginatedResponse, ApiResponse } from '../types';

export const topicsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<Topic>> => {
    const response = await apiClient.get<PaginatedResponse<Topic>>('/topics', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Topic> => {
    const response = await apiClient.get<ApiResponse<Topic>>(`/topics/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<Topic> => {
    const response = await apiClient.post<ApiResponse<Topic>>('/topics', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<Topic> => {
    const response = await apiClient.put<ApiResponse<Topic>>(`/topics/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/topics/${id}`);
  },
};
