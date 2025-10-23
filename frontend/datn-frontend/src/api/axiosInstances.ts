import axios from 'axios';
import { SERVICE_URLS } from './serviceConfig';
import { attachAuthInterceptors } from '../redux/refreshInterceptor';

function createApi(baseURL: string) {
    const instance = axios.create({ baseURL });
    attachAuthInterceptors(instance);
    return instance;
}

export const gatewayApi = createApi(SERVICE_URLS.gateway);
