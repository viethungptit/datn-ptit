import { gatewayApi } from './axiosInstances';

// Mẫu gọi API cho service Admin
export const updateAdminInfo = (data: any) => gatewayApi.put('/admin', data);

export const getAllLogsApi = () =>
    gatewayApi.get('/api/admin-service/logs');