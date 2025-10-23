import { store } from './store';
import { refreshToken } from './authReduxAPI';
import { setAuthData, logout } from './authSlice';
import axios from 'axios';

type QueueItem = {
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    originalRequest: any;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: any, token: string | null = null) {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            if (token) {
                prom.originalRequest.headers = prom.originalRequest.headers || {};
                prom.originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            prom.resolve(axios(prom.originalRequest));
        }
    });
    failedQueue = [];
}

export function attachAuthInterceptors(instance: ReturnType<typeof axios.create>, useCookies = false) {
    // Prevent attaching multiple times to same instance
    if ((instance as any).__hasAuthInterceptors) {
        console.debug('attachAuthInterceptors: already attached to this instance');
        return;
    }
    (instance as any).__hasAuthInterceptors = true;
    console.debug('attachAuthInterceptors: attaching interceptors to instance');

    instance.interceptors.request.use(
        (config) => {
            const state = store.getState();
            const token = state.auth.accessToken;
            if (token && !useCookies) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            if (useCookies) config.withCredentials = true;
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const data = error.response?.data;
            const status = error.response?.status;

            // Debug logging
            console.debug('Intercepted error for URL:', originalRequest?.url, 'status:', status, 'data:', data);

            // Adjust condition to match your API's 401/expired response
            const isAccessExpired =
                (data?.status === 401 && data?.message === 'Access token đã hết hạn') ||
                status === 401; // fallback to HTTP status

            if (isAccessExpired && !originalRequest?._retry) {
                originalRequest._retry = true;

                if (isRefreshing) {
                    // queue this request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject, originalRequest });
                    });
                }

                isRefreshing = true;
                console.debug('Starting token refresh...');
                try {
                    const authData = await refreshToken();
                    console.debug('Token refreshed:', authData);
                    store.dispatch(setAuthData(authData));
                    if (authData.accessToken) localStorage.setItem('accessToken', authData.accessToken);

                    processQueue(null, authData.accessToken ?? null);

                    originalRequest.headers = originalRequest.headers || {};
                    if (authData.accessToken) {
                        originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
                    }
                    return instance(originalRequest);
                } catch (err) {
                    console.debug('Refresh token failed:', err);
                    processQueue(err, null);
                    store.dispatch(logout());
                    localStorage.removeItem('accessToken');
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error.response?.data || error);
        }
    );
}