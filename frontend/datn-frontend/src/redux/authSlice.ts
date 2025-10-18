import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { loginApi, refreshTokenApi } from '../api/userApi';

interface AuthState {
    accessToken: string | null;
    userId: string | null;
    role: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    accessToken: null,
    userId: null,
    role: null,
    isAuthenticated: false,
};

// Thunk login
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await loginApi(email, password);
            const { accessToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            const decoded: any = jwtDecode(accessToken);
            return {
                accessToken,
                userId: decoded.userId,
                role: decoded.role,
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err || 'Login failed');
        }
    }
);

// Thunk refreshToken
export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const res = await refreshTokenApi();
            const { accessToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            const decoded: any = jwtDecode(accessToken);
            return {
                accessToken,
                userId: decoded.userId,
                role: decoded.role,
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err || 'Refresh failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            localStorage.removeItem('accessToken');
            state.accessToken = null;
            state.userId = null;
            state.role = null;
            state.isAuthenticated = false;
        },
        setAuthFromToken(state, action: PayloadAction<string>) {
            const decoded: any = jwtDecode(action.payload);
            state.accessToken = action.payload;
            state.userId = decoded.userId;
            state.role = decoded.role;
            state.isAuthenticated = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken;
                state.userId = action.payload.userId;
                state.role = action.payload.role;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state) => {
                state.accessToken = null;
                state.userId = null;
                state.role = null;
                state.isAuthenticated = false;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken;
                state.userId = action.payload.userId;
                state.role = action.payload.role;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.accessToken = null;
                state.userId = null;
                state.role = null;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, setAuthFromToken } = authSlice.actions;

// Selectors
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectRole = (state: { auth: AuthState }) => state.auth.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;
