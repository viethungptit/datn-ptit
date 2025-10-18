import { userApi } from './axiosInstances';

// Auth APIs
export const loginApi = (email: string, password: string) => userApi.post('/api/user-service/auth/login', { email, password });
export const refreshTokenApi = () => userApi.post('/api/user-service/auth/refresh', {}, { withCredentials: true });
