import { gatewayApi } from './axiosInstances';

// Mẫu gọi API cho service Recommend
export const addRecommendation = (data: any) => gatewayApi.post('/recommendations', data);
