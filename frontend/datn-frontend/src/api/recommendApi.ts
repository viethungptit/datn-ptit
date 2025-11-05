import { gatewayApi } from './axiosInstances';

export const getJobMatch = (jobId: string) =>
    gatewayApi.get(`/api/recommend-service/match/${jobId}`);

// payload.content should be a string (current content / context) and styles is string (professional|concise|impact)
export const suggestSectionCV = (payload: { language?: string; position?: string; section?: string; content?: string; styles?: string; }) =>
    gatewayApi.post('/api/recommend-service/suggest', payload);
