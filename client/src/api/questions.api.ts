import apiClient from './client';

export const questionsApi = {
  list: async (params?: any) => { const r = await apiClient.get('/questions', { params }); return r.data; },
  getById: async (id: string) => { const r = await apiClient.get(`/questions/${id}`); return r.data.data; },
  create: async (data: any) => { const r = await apiClient.post('/questions', data); return r.data.data; },
  update: async (id: string, data: any) => { const r = await apiClient.put(`/questions/${id}`, data); return r.data.data; },
  delete: async (id: string) => { await apiClient.delete(`/questions/${id}`); },
};
