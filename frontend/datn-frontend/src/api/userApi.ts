import { userApi } from './axiosInstances';

// Mẫu gọi API cho service User
export const getUserProfile = () => userApi.get('/profile');
export const updateUserProfile = (data: any) => userApi.put('/profile', data);
export const getUserList = () => userApi.get('/users');
