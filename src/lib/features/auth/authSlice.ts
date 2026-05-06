import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: { id: string, name: string, email: string } | null; 
    isAuthenticated: boolean;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AuthState['user']>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
    },
})

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
