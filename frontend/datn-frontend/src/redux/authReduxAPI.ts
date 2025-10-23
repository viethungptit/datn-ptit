import { jwtDecode } from 'jwt-decode';
import { loginApi, refreshTokenApi } from '../api/userApi';

export async function login({ email, password }: { email: string; password: string }) {
    try {
        const res = await loginApi(email, password);
        const { accessToken } = res.data;
        const decoded = jwtDecode(accessToken) as any;
        return {
            accessToken,
            userId: decoded.sub,
            role: decoded.role,
        };
    } catch (err: any) {
        throw err || 'Login failed';
    }
}

export async function refreshToken() {
    try {
        const res = await refreshTokenApi();
        const { accessToken } = res.data;
        const decoded = jwtDecode(accessToken) as any;
        return {
            accessToken,
            userId: decoded.sub,
            role: decoded.role,
        };
    } catch (err: any) {
        throw err || 'Refresh failed';
    }
}
