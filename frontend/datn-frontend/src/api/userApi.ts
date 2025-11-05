import { gatewayApi } from './axiosInstances';

// Auth APIs
export const loginApi = (email: string, password: string) =>
    gatewayApi.post('/api/user-service/auth/login', { email, password }, { withCredentials: true });

export const refreshTokenApi = () =>
    gatewayApi.post('/api/user-service/auth/refresh', {}, { withCredentials: true });

export const logoutAPI = () =>
    gatewayApi.post('/api/user-service/auth/logout', {}, { withCredentials: true });

export const registerApi = (payload: { email: string; password: string; fullName: string; phone: string; role: string }) =>
    gatewayApi.post('/api/user-service/auth/register', payload, { withCredentials: true });

export const verifyOtpApi = (payload: { email: string; otp: string; }) =>
    gatewayApi.post('/api/user-service/auth/verify-otp', payload, { withCredentials: true });

export const resetOtpApi = (payload: { email: string; }) =>
    gatewayApi.post('/api/user-service/auth/reset-otp', payload, { withCredentials: true });

export const requestResetPasswordApi = (payload: { email: string }) =>
    gatewayApi.post('/api/user-service/auth/request-reset-password', payload, { withCredentials: true });

export const resetPasswordApi = (payload: { email: string; newPassword: string; otp: string }) =>
    gatewayApi.post('/api/user-service/auth/reset-password', payload, { withCredentials: true });


// User APIs
export const getCurrentUserProfile = () =>
    gatewayApi.get(`/api/user-service/users/me`);

export const getAllUsersApi = () =>
    gatewayApi.get('/api/user-service/users');

export const getUserByIdApi = (userId: string) =>
    gatewayApi.get(`/api/user-service/users/${userId}`);

export const updateUserApi = (userId: string, payload: { password: string; fullName?: string; phone?: string; role?: string }) =>
    gatewayApi.put(`/api/user-service/users/${userId}`, payload);

export const deleteUserApi = (userId: string) =>
    gatewayApi.delete(`/api/user-service/users/${userId}`);

export const changePasswordApi = (payload: { email: string; oldPassword: string; newPassword: string }) =>
    gatewayApi.post('/api/user-service/users/change-password', payload);

export const createNewUserApi = (payload: { email: string; password: string; fullName: string; phone: string; role: string; }) =>
    gatewayApi.post('/api/user-service/users', payload);

export const updateCompanyApi = (companyId: string, payload: FormData) =>
    gatewayApi.put(`/api/user-service/companies/${companyId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteCompanyApi = (companyId: string) =>
    gatewayApi.delete(`/api/user-service/companies/${companyId}`);

export const verifyCompanyApi = (companyId: string) =>
    gatewayApi.put(`/api/user-service/companies/${companyId}/verify`);

export const getAllCompaniesApi = () =>
    gatewayApi.get('/api/user-service/companies');

export const createCompanyApi = (payload: FormData) =>
    gatewayApi.post('/api/user-service/companies', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const upsertEmployerApi = (userId: string, request: { position?: string; companyId?: string }) =>
    gatewayApi.put(`/api/user-service/user-profile/employer/${userId}`, null, { params: { request } });

export const upsertCandidateApi = (userId: string, payload: FormData) =>
    gatewayApi.put(`/api/user-service/user-profile/candidate/${userId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getAllFilesByMeApi = () =>
    gatewayApi.get('/api/user-service/files/me');

export const uploadFileApi = (payload: FormData) =>
    gatewayApi.post('/api/user-service/files/upload', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteFileApi = (fileId: string) =>
    gatewayApi.delete(`/api/user-service/files/${fileId}`);

export const getCompanyByUserIdApi = (userId: string, internalSecret?: string) =>
    gatewayApi.get(`/api/user-service/companies/by-user/${userId}`, {
        headers: internalSecret ? { 'X-Internal-Secret': internalSecret } : undefined,
    });

export const getUserByEmailApi = (email: string, internalSecret?: string) =>
    gatewayApi.get('/api/user-service/users/by-email', {
        params: { email },
        headers: internalSecret ? { 'X-Internal-Secret': internalSecret } : undefined,
    });

export const getCompanyByIdApi = (companyId: string, internalSecret?: string) =>
    gatewayApi.get(`/api/user-service/companies/${companyId}`, {
        headers: internalSecret ? { 'X-Internal-Secret': internalSecret } : undefined,
    });


