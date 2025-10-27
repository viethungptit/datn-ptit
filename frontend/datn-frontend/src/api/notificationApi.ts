import { gatewayApi } from './axiosInstances';

// Notifications
export const getAllNotifications = () =>
    gatewayApi.get('/api/notification-service/notifications');

export const getNotification = (id: string) =>
    gatewayApi.get(`/api/notification-service/notifications/${id}`);

export const createNotification = (payload: { userId?: string; template?: any; eventType?: string; payload?: string }) =>
    gatewayApi.post('/api/notification-service/notifications', payload);

export const deleteNotification = (id: string) =>
    gatewayApi.delete(`/api/notification-service/notifications/${id}`);

// Templates
export const getAllTemplates = () =>
    gatewayApi.get('/api/notification-service/templates');

export const createTemplate = (payload: { eventType: string; emailSubjectTemplate?: string; emailBodyTemplate?: string; inappBodyTemplate?: string }) =>
    gatewayApi.post('/api/notification-service/templates', payload);

export const updateTemplate = (templateId: string, payload: { eventType?: string; emailSubjectTemplate?: string; emailBodyTemplate?: string; inappBodyTemplate?: string }) =>
    gatewayApi.put(`/api/notification-service/templates/${templateId}`, payload);

export const deleteTemplate = (templateId: string) =>
    gatewayApi.delete(`/api/notification-service/templates/${templateId}`);

export const getTemplateByEventType = (eventType: string) =>
    gatewayApi.get(`/api/notification-service/templates/${encodeURIComponent(eventType)}`);

// In-app deliveries
export const getAllInappDeliveries = () =>
    gatewayApi.get('/api/notification-service/inapp-deliveries/all');

export const markAllInappAsRead = () =>
    gatewayApi.put('/api/notification-service/inapp-deliveries/all');

export const markInappAsRead = (inappDeliId: string) =>
    gatewayApi.put(`/api/notification-service/inapp-deliveries/${inappDeliId}`);

export const deleteInappDelivery = (inappDeliId: string) =>
    gatewayApi.delete(`/api/notification-service/inapp-deliveries/${inappDeliId}`);

// Email deliveries
export const getAllEmailDeliveries = () =>
    gatewayApi.get('/api/notification-service/email-deliveries');

export const createEmailDelivery = (payload: { notification?: any; email?: string; subject?: string; body?: string; status?: string }) =>
    gatewayApi.post('/api/notification-service/email-deliveries', payload);

export const getEmailDelivery = (id: string) =>
    gatewayApi.get(`/api/notification-service/email-deliveries/${id}`);

export const deleteEmailDelivery = (id: string) =>
    gatewayApi.delete(`/api/notification-service/email-deliveries/${id}`);

export const retrySendEmailDelivery = (id: string) =>
    gatewayApi.post(`/api/notification-service/email-deliveries/${id}/retry`);