import { recruitApi } from './axiosInstances';

// Mẫu gọi API cho service Recruit
export const getRecruitJobs = () => recruitApi.get('/jobs');
export const postRecruitJob = (data: any) => recruitApi.post('/jobs', data);
export const getRecruiters = () => recruitApi.get('/recruiters');
