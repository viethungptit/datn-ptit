import axios from 'axios';
import { SERVICE_URLS } from './serviceConfig';

function setupInterceptors(instance: ReturnType<typeof axios.create>) {
    instance.interceptors.response.use(
        (response: any) => {
            return response.data;
        },
        (error: any) => {
            return Promise.reject(error.response?.data || error.message);
        }
    );
    return instance;
}

export const userApi = setupInterceptors(axios.create({ baseURL: SERVICE_URLS.user }));
export const adminApi = setupInterceptors(axios.create({ baseURL: SERVICE_URLS.admin }));
export const recruitApi = setupInterceptors(axios.create({ baseURL: SERVICE_URLS.recruit }));
export const notificationApi = setupInterceptors(axios.create({ baseURL: SERVICE_URLS.notification }));
export const recommendApi = setupInterceptors(axios.create({ baseURL: SERVICE_URLS.recommend }));
