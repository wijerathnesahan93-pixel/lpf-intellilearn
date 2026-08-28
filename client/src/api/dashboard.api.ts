import apiClient from './client';

export const dashboardApi = {
  getDashboard: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },
};
