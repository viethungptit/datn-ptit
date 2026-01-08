import { gatewayApi } from "./axiosInstances";

// Auth APIs
export const loginApi = (email: string, password: string) =>
  gatewayApi.post(
    "/api/user-service/auth/login",
    { email, password },
    { withCredentials: true }
  );

export const refreshTokenApi = () =>
  gatewayApi.post(
    "/api/user-service/auth/refresh",
    {},
    { withCredentials: true }
  );

export const logoutAPI = () =>
  gatewayApi.post(
    "/api/user-service/auth/logout",
    {},
    { withCredentials: true }
  );

export const registerApi = (payload: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
}) =>
  gatewayApi.post("/api/user-service/auth/register", payload, {
    withCredentials: true,
  });

export const verifyOtpApi = (payload: { email: string; otp: string }) =>
  gatewayApi.post("/api/user-service/auth/verify-otp", payload, {
    withCredentials: true,
  });

export const resetOtpApi = (payload: { email: string }) =>
  gatewayApi.post("/api/user-service/auth/reset-otp", payload, {
    withCredentials: true,
  });

export const requestResetPasswordApi = (payload: { email: string }) =>
  gatewayApi.post("/api/user-service/auth/request-reset-password", payload, {
    withCredentials: true,
  });

export const resetPasswordApi = (payload: {
  email: string;
  newPassword: string;
  otp: string;
}) =>
  gatewayApi.post("/api/user-service/auth/reset-password", payload, {
    withCredentials: true,
  });

// User APIs
export const getCurrentUserProfile = () =>
  gatewayApi.get(`/api/user-service/users/me`);

export const updateCurrentUserApi = (payload: {
  fullName?: string;
  phone?: string;
}) => gatewayApi.put(`/api/user-service/users/me`, payload);

export const getAllUsersApi = () => gatewayApi.get("/api/user-service/users");

export const getAllUsersApiWithPagination = (
  page: number = 0,
  pageSize: number = 10
) =>
  gatewayApi.get("/api/user-service/users/paged", {
    params: { page, size: pageSize },
  });

export const getUserByIdApi = (userId: string) =>
  gatewayApi.get(`/api/user-service/users/${userId}`);

export const updateUserApi = (
  userId: string,
  payload: {
    password: string;
    fullName?: string;
    phone?: string;
    role?: string;
  }
) => gatewayApi.put(`/api/user-service/users/${userId}`, payload);

export const deleteUserApi = (userId: string) =>
  gatewayApi.delete(`/api/user-service/users/${userId}`);

export const changePasswordApi = (payload: {
  oldPassword: string;
  newPassword: string;
}) => gatewayApi.post("/api/user-service/users/change-password", payload);

export const createNewUserApi = (payload: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
}) => gatewayApi.post("/api/user-service/users", payload);

export const updateCompanyApi = (companyId: string, payload: FormData) =>
  gatewayApi.put(`/api/user-service/companies/${companyId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCompanyApi = (companyId: string) =>
  gatewayApi.delete(`/api/user-service/companies/${companyId}`);

export const verifyCompanyApi = (companyId: string) =>
  gatewayApi.put(`/api/user-service/companies/${companyId}/verify`);

export const getAllCompaniesApi = () =>
  gatewayApi.get("/api/user-service/companies");

export const searchCompaniesApi = (keyword: string) =>
  gatewayApi.get(`/api/user-service/companies`, { params: { keyword } });

export const getAllCompaniesApiWithPagination = (
  page: number = 0,
  pageSize: number = 10
) =>
  gatewayApi.get("/api/user-service/companies/paged", {
    params: { page, size: pageSize },
  });

export const searchCompaniesApiWithPagination = (
  keyword: string,
  page: number = 0,
  pageSize: number = 10
) =>
  gatewayApi.get("/api/user-service/companies/paged", {
    params: { keyword, page, pageSize },
  });

export const verifyInviteTokenApi = (token: string) =>
  gatewayApi.get("/api/user-service/invitations/verify", {
    params: { token },
  });
export const inviteEmployerApi = (inviteEmail: string, companyId: string) =>
  gatewayApi.post("/api/user-service/invitations", {
    email: inviteEmail,
    companyId,
  });

export const acceptInviteApi = (token: string) =>
  gatewayApi.post("/api/user-service/invitations/accept", { token });

export const getDetailCompanyApi = (companyId: string) =>
  gatewayApi.get(`/api/user-service/companies/${companyId}`);

export const createCompanyApi = (payload: FormData) =>
  gatewayApi.post("/api/user-service/companies", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getAllEmployersForCompanyApi = (companyId: string | undefined) => {
  return gatewayApi.get(`/api/user-service/companies/${companyId}/employers`);
};

export const leaveCompanyApi = () =>
  gatewayApi.put(`/api/user-service/user-profile/employer/me/leave`);

export const leaveCompanyForAdminApi = (userId: string) =>
  gatewayApi.put(
    `/api/user-service/user-profile/employer/for-admin/${userId}/leave`
  );

export const upsertEmployerApi = (payload: {
  position?: string;
  companyId?: string;
  status?: string;
  isAdmin?: boolean;
}) => gatewayApi.put(`/api/user-service/user-profile/employer/me`, payload);

export const upsertCandidateApi = (payload: {
  dob?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
}) => gatewayApi.put(`/api/user-service/user-profile/candidate/me`, payload);

export const upsertEmployerForAdminApi = (
  userId: string,
  request: {
    position?: string;
    companyId?: string;
    status?: string;
    isAdmin?: boolean;
  }
) => {
  return gatewayApi.put(
    `/api/user-service/user-profile/employer/for-admin/${userId}`,
    request
  );
};

export const upsertCandidateForAdminApi = (userId: string, payload: FormData) =>
  gatewayApi.put(
    `/api/user-service/user-profile/candidate/for-admin/${userId}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

export const getAllFilesByMeApi = () =>
  gatewayApi.get("/api/user-service/files/me");

export const uploadFileApi = (payload: FormData) =>
  gatewayApi.post("/api/user-service/files/upload", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteFileApi = (fileId: string) =>
  gatewayApi.delete(`/api/user-service/files/${fileId}`);
