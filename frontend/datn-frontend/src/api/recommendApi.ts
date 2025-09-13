import { recommendApi } from './axiosInstances';

// Mẫu gọi API cho service Recommend
export const getRecommendations = () => recommendApi.get('/recommendations');
export const addRecommendation = (data: any) => recommendApi.post('/recommendations', data);
