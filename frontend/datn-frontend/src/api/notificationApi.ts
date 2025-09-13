import { notificationApi } from './axiosInstances';

// Mẫu gọi API cho service Notification
export const getNotifications = () => notificationApi.get('/notifications');
export const markNotificationRead = (id: string) => notificationApi.post(`/notifications/${id}/read`);
