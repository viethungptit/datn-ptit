import { userApi } from './axiosInstances';

// Auth APIs
export const loginApi = (email: string, password: string) => userApi.post('/api/auth/login', { email, password });
export const refreshTokenApi = () => userApi.post('/api/auth/refresh', {}, { withCredentials: true });
