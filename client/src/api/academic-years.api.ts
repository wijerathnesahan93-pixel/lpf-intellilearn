import apiClient from './client';
import { AcademicYear, PaginatedResponse, ApiResponse } from '../types';

export const academicYearsApi = {
  list: async (params?: Record<string, any>): Promise<PaginatedResponse<AcademicYear>> => {
    const response = await apiClient.get<PaginatedResponse<AcademicYear>>('/academic-years', { params });
    return response.data;
  },
  getById: async (id: string): Promise<AcademicYear> => {
    const response = await apiClient.get<ApiResponse<AcademicYear>>(`/academic-years/${id}`);
    return response.data.data;
  },
  create: async (data: any): Promise<AcademicYear> => {
    const response = await apiClient.post<ApiResponse<AcademicYear>>('/academic-years', data);
    return response.data.data;
  },
  update: async (id: string, data: any): Promise<AcademicYear> => {
    const response = await apiClient.put<ApiResponse<AcademicYear>>(`/academic-years/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/academic-years/${id}`);
  },
};
