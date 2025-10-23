import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

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

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.accessToken = null;
            state.userId = null;
            state.role = null;
            state.isAuthenticated = false;
        },
        setAuthFromToken(state, action) {
            const decoded: any = jwtDecode(action.payload);
            state.accessToken = action.payload;
            state.userId = decoded.sub;
            state.role = decoded.role;
            state.isAuthenticated = true;
        },
        setAuthData(state, action) {
            state.accessToken = action.payload.accessToken;
            state.userId = action.payload.userId;
            state.role = action.payload.role;
            state.isAuthenticated = true;
        },
        clearAuth(state) {
            state.accessToken = null;
            state.userId = null;
            state.role = null;
            state.isAuthenticated = false;
        },
    },
});

export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectRole = (state: { auth: AuthState }) => state.auth.role;
export const { logout, setAuthFromToken, setAuthData, clearAuth } = authSlice.actions;
export default authSlice.reducer;
