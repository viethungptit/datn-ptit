import { adminApi } from './axiosInstances';

// Mẫu gọi API cho service Admin
export const getAdminDashboard = () => adminApi.get('/dashboard');
export const getAdminList = () => adminApi.get('/admins');
export const updateAdminInfo = (data: any) => adminApi.put('/admin', data);
