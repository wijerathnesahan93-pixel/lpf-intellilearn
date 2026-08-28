import apiClient from './client';

export const recommendationsApi = {
  list: async (params?: any) => { const r = await apiClient.get('/recommendations', { params }); return r.data; },
  listForStudent: async (studentId: string, params?: any) => { const r = await apiClient.get(`/recommendations/student/${studentId}`, { params }); return r.data; },
  generate: async (studentId: string, subjectId: string) => { const r = await apiClient.post(`/recommendations/generate/${studentId}/${subjectId}`); return r.data.data; },
  markCompleted: async (id: string) => { const r = await apiClient.put(`/recommendations/${id}/complete`); return r.data.data; },
};
