import { gatewayApi } from './axiosInstances';

// Mẫu gọi API cho service Notification
export const getNotifications = () => gatewayApi.get('/notifications');
