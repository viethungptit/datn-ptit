import { gatewayApi } from './axiosInstances';

export interface CVRequest {
    language?: string | null;
    position: string;
    section: string;
    content: string;
    styles?: string;
}

export const getJobMatch = (jobId: string, top_k?: number) =>
    gatewayApi.get(`/api/recommend-service/match/${jobId}`, { params: { top_k } });

export const suggestSectionCV = (payload: CVRequest) =>
    gatewayApi.post('/api/recommend-service/suggest', payload);

export const listRecommendBatches = (jobId: string, params?: { limit?: number }) =>
    gatewayApi.get(`/api/recommend-service/recommend_batches/${jobId}`, { params });

export const getRecommendBatch = (batchId: string) =>
    gatewayApi.get(`/api/recommend-service/recommend_batches/${batchId}/detail`);

