import { gatewayApi } from './axiosInstances';
// Recruit service APIs
// Jobs
export const getJob = (jobId: string) =>
    gatewayApi.get(`/api/recruit-service/jobs/${jobId}`);

export const updateJob = (
    jobId: string,
    payload: {
        companyId?: string;
        title?: string;
        description?: string;
        salaryRange?: string;
        location?: string;
        city?: string;
        jobType?: string;
        groupTagIds?: string[];
        jobTagIds?: string[];
        quantity?: number;
        deadline?: string;
    }
) => gatewayApi.put(`/api/recruit-service/jobs/${jobId}`, payload);

export const deleteJob = (jobId: string) =>
    gatewayApi.delete(`/api/recruit-service/jobs/${jobId}`);

export const closeJob = (jobId: string) =>
    gatewayApi.put(`/api/recruit-service/jobs/${jobId}/close`);

export const createJob = (payload: { title: string; description?: string; salaryRange?: string; location?: string; city?: string; jobType?: string; groupTagIds?: string[]; jobTagIds?: string[]; quantity?: number; deadline?: string; }) =>
    gatewayApi.post('/api/recruit-service/jobs', payload);

export const createJobTag = (payload: { jobName: string }) =>
    gatewayApi.post('/api/recruit-service/job-tag', payload);

export const updateJobTag = (jobTagId: string, payload: { jobName: string }) =>
    gatewayApi.put(`/api/recruit-service/job-tag/${jobTagId}`, payload);

export const deleteJobTag = (jobTagId: string) =>
    gatewayApi.delete(`/api/recruit-service/job-tag/${jobTagId}`);

export const getAllJobTags = () =>
    gatewayApi.get('/api/recruit-service/job-tag/all');

export const getJobTagsByJob = (jobId: string) =>
    gatewayApi.get('/api/recruit-service/job-tag/mapping', { params: { job_id: jobId } });

export const addJobTagMapping = (payload: { jobTagId: string; jobId: string }) =>
    gatewayApi.post('/api/recruit-service/job-tag/mapping', payload);

export const createGroupJobTag = (payload: { groupJobName: string }) =>
    gatewayApi.post('/api/recruit-service/group-tag', payload);

export const updateGroupJobTag = (groupTagId: string, payload: { groupJobName: string }) =>
    gatewayApi.put(`/api/recruit-service/group-tag/${groupTagId}`, payload);

export const deleteGroupJobTag = (groupTagId: string) =>
    gatewayApi.delete(`/api/recruit-service/group-tag/${groupTagId}`);

export const getAllGroupJobTags = () =>
    gatewayApi.get('/api/recruit-service/group-tag/all');

export const getGroupJobTagsByJob = (jobId: string) =>
    gatewayApi.get('/api/recruit-service/group-tag/mapping', { params: { job_id: jobId } });

export const addGroupJobTagMapping = (payload: { groupTagId: string; jobId: string }) =>
    gatewayApi.post('/api/recruit-service/group-tag/mapping', payload);

export const deleteGroupJobTagMapping = (jgTagId: string) =>
    gatewayApi.delete(`/api/recruit-service/group-tag/mapping/${jgTagId}`);

export const getFavorites = () =>
    gatewayApi.get('/api/recruit-service/favorite');

export const addFavorite = (payload: { jobId: string }) =>
    gatewayApi.post('/api/recruit-service/favorite', payload);

export const removeFavorite = (favoriteId: string) =>
    gatewayApi.delete(`/api/recruit-service/favorite/${favoriteId}`);

export const createCV = (payload: { templateId?: string; title?: string; dataJson?: string }) =>
    gatewayApi.post('/api/recruit-service/cvs', payload);

export const getCV = (cvId: string) =>
    gatewayApi.get(`/api/recruit-service/cvs/${cvId}`);

export const updateCV = (cvId: string, payload: { templateId?: string; title?: string; dataJson?: string }) =>
    gatewayApi.put(`/api/recruit-service/cvs/${cvId}`, payload);

export const deleteCV = (cvId: string) =>
    gatewayApi.delete(`/api/recruit-service/cvs/${cvId}`);

export const exportCV = (cvId: string) =>
    gatewayApi.post(`/api/recruit-service/cvs/${cvId}/export`);

export const uploadCV = (payload: FormData) =>
    gatewayApi.post('/api/recruit-service/cvs/upload', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getAllCVs = () =>
    gatewayApi.get('/api/recruit-service/cvs/all');

export const getAllCVsByUser = (userId: string) =>
    gatewayApi.get(`/api/recruit-service/cvs/all-by-user/${userId}`);

export const getTemplateDetail = (templateId: string) =>
    gatewayApi.get(`/api/recruit-service/cv-templates/${templateId}`);

export const updateTemplate = (templateId: string, payload: FormData) =>
    gatewayApi.put(`/api/recruit-service/cv-templates/${templateId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteTemplate = (templateId: string) =>
    gatewayApi.delete(`/api/recruit-service/cv-templates/${templateId}`);

export const createTemplate = (payload: FormData) =>
    gatewayApi.post('/api/recruit-service/cv-templates/', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getAllTemplates = () =>
    gatewayApi.get('/api/recruit-service/cv-templates/all');

export const getApplicationsByJob = (jobId: string) =>
    gatewayApi.get('/api/recruit-service/applications', { params: { job_id: jobId } });

export const applyForJob = (payload: { jobId: string; cvId: string }) =>
    gatewayApi.post('/api/recruit-service/applications', payload);

export const updateApplicationStatus = (applicationId: string, payload: { status: string }) =>
    gatewayApi.put(`/api/recruit-service/applications/${applicationId}`, payload);

export const deleteApplication = (applicationId: string) =>
    gatewayApi.delete(`/api/recruit-service/applications/${applicationId}`);

export const getAllJobs = () =>
    gatewayApi.get('/api/recruit-service/jobs/all');

export const getAllJobsByCompany = (companyId: string) =>
    gatewayApi.get(`/api/recruit-service/jobs/all-by-company/${companyId}`);

export const getAllJobsByCity = (city: string) =>
    gatewayApi.get(`/api/recruit-service/jobs/all-by-city/${city}`);

export const postRecruitJob = (data: { title: string; description?: string; salaryRange?: string; location?: string; city?: string; jobType?: string; groupTagIds?: string[]; jobTagIds?: string[]; quantity?: number; deadline?: string; }) =>
    gatewayApi.post('/api/recruit-service/jobs', data);
