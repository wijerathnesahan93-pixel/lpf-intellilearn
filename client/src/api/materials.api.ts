import apiClient from './client';
import { LearningMaterial, PaginatedResponse, ApiResponse } from '../types';

export const materialsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<LearningMaterial>> => {
    const response = await apiClient.get<PaginatedResponse<LearningMaterial>>('/materials', { params });
    return response.data;
  },
  getById: async (id: string): Promise<LearningMaterial> => {
    const response = await apiClient.get<ApiResponse<LearningMaterial>>(`/materials/${id}`);
    return response.data.data;
  },
  create: async (formData: FormData): Promise<LearningMaterial> => {
    const response = await apiClient.post<ApiResponse<LearningMaterial>>('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  update: async (id: string, formData: FormData): Promise<LearningMaterial> => {
    const response = await apiClient.put<ApiResponse<LearningMaterial>>(`/materials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/materials/${id}`);
  },
};
