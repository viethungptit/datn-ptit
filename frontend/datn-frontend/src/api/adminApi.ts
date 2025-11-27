import { gatewayApi } from './axiosInstances';

export const getAllLogsApi = () =>
    gatewayApi.get('/api/admin-service/logs');

export const getAllLogsApiWithPagination = (
    page: number = 0,
    pageSize: number = 10
) =>
    gatewayApi.get("/api/admin-service/logs/paged", {
        params: { page, size: pageSize },
    });

// Alert recipients
export const getAlertRecipients = () =>
    gatewayApi.get('/api/admin-service/alert-recipients');

export const createAlertRecipients = (data: { emails: string[] }) =>
    gatewayApi.post('/api/admin-service/alert-recipients', data);

export const getSystemHealthApi = () =>
    gatewayApi.get('/api/admin-service/system-health');

// System stats
export const getStatsApi = () =>
    gatewayApi.get('/api/admin-service/stats');

export const getAllStatsApi = (from?: string, to?: string) =>
    gatewayApi.get('/api/admin-service/stats/all', {
        params: {
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
        }
    });

