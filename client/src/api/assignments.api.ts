import apiClient from './client';

export const assignmentsApi = {
  list: async (params?: any) => { const r = await apiClient.get('/assignments', { params }); return r.data; },
  getById: async (id: string) => { const r = await apiClient.get(`/assignments/${id}`); return r.data.data; },
  create: async (data: any) => { const r = await apiClient.post('/assignments', data); return r.data.data; },
  update: async (id: string, data: any) => { const r = await apiClient.put(`/assignments/${id}`, data); return r.data.data; },
  delete: async (id: string) => { await apiClient.delete(`/assignments/${id}`); },
  getSubmissions: async (id: string) => { const r = await apiClient.get(`/assignments/${id}/submissions`); return r.data.data; },
  submit: async (id: string, data: any) => { const r = await apiClient.post(`/assignments/${id}/submit`, data); return r.data.data; },
  reviewSubmission: async (submissionId: string, data: any) => { const r = await apiClient.put(`/assignments/submissions/${submissionId}/review`, data); return r.data.data; },
  getMySubmissions: async () => { const r = await apiClient.get('/assignments/my-submissions'); return r.data.data; },
};
