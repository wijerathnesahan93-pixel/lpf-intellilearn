import apiClient from './client';

export const analyticsApi = {
  getStudentPerformance: async (studentId: string) => { const r = await apiClient.get(`/analytics/student/${studentId}`); return r.data.data; },
  getSubjectAnalytics: async (subjectId: string, classId?: string) => { const r = await apiClient.get(`/analytics/subject/${subjectId}`, { params: { classId } }); return r.data.data; },
  getClassPerformance: async (classId: string) => { const r = await apiClient.get(`/analytics/class/${classId}`); return r.data.data; },
};
