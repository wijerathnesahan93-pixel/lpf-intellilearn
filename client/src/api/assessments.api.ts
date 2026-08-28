import apiClient from './client';

export const assessmentsApi = {
  list: async (params?: any) => { const r = await apiClient.get('/assessments', { params }); return r.data; },
  getById: async (id: string) => { const r = await apiClient.get(`/assessments/${id}`); return r.data.data; },
  create: async (data: any) => { const r = await apiClient.post('/assessments', data); return r.data.data; },
  update: async (id: string, data: any) => { const r = await apiClient.put(`/assessments/${id}`, data); return r.data.data; },
  delete: async (id: string) => { await apiClient.delete(`/assessments/${id}`); },
  startAttempt: async (id: string) => { const r = await apiClient.post(`/assessments/${id}/start`); return r.data.data; },
  submitAttempt: async (attemptId: string, data: any) => { const r = await apiClient.post(`/assessments/attempts/${attemptId}/submit`, data); return r.data.data; },
  getAttempts: async (id: string) => { const r = await apiClient.get(`/assessments/${id}/attempts`); return r.data.data; },
  getResults: async (id: string) => { const r = await apiClient.get(`/assessments/${id}/results`); return r.data.data; },
};
