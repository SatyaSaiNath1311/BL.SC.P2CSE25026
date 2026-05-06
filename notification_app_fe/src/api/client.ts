import axios from 'axios';

const API_URL = '/api-proxy/evaluation-service';

export const getNotifications = async (params: { limit?: number; page?: number; notification_type?: string } = {}) => {
  const token = import.meta.env.VITE_AUTH_TOKEN;
  
  if (!token) {
    throw new Error('AUTH_TOKEN is not configured in .env');
  }

  const response = await axios.get(`${API_URL}/notifications`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params
  });

  return response.data;
};
