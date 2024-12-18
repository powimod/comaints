import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import STATUS from './status';
import ComaintBackendApiSingleton from '../ComaintApi.js';


export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ email, password }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.auth.register({email, password});
        } catch (error) {
            console.error('Registration failed: ', error.message);
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const validateAuthCode = createAsyncThunk(
    'auth/validateAuthCode',
    async ({ email, code }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.auth.validate({ email, code });
        } catch (error) {
            console.error('Auth code validation failed: ', error.message);
            return rejectWithValue(error.message || 'Auth code validation');
        }
    }
);

export const resendAuthCode = createAsyncThunk(
    'auth/resendAuthCode',
    async ({ email }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.auth.resendCode(email);
        } catch (error) {
            console.error('Can not resend auth code: ', error.message);
            return rejectWithValue(error.message || 'Auth code error');
        }
    }
);


export const authResetPassword = createAsyncThunk(
    'auth/authResetPassword',
    async ({ email, password }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.auth.resetPassword(email, password);
        } catch (error) {
            console.log("dOm Ac error", error);
            return rejectWithValue(error.message || 'Send password reset code error');
        }
    }

);
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue, getState }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            await comaintApi.auth.login(email, password);
        } catch (error) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            await comaintApi.auth.logout();
        } catch (error) {
            console.error('Logout failed: ', error);
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        authStatus: STATUS.IDLE,
        authError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // registration
            .addCase(registerUser.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null; })
            .addCase(registerUser.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; })
            .addCase(registerUser.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload; })

            // auth code validation
            .addCase(validateAuthCode.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null; })
            .addCase(validateAuthCode.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; })
            .addCase(validateAuthCode.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload; })

            // resend auth code 
            .addCase(resendAuthCode.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null; })
            .addCase(resendAuthCode.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; })
            .addCase(resendAuthCode.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload; })

            // send reset password validation code
            .addCase(authResetPassword.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null; })
            .addCase(authResetPassword.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; })
            .addCase(authResetPassword.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload; })

            // login
            .addCase(loginUser.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null; })
            .addCase(loginUser.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; })
            .addCase(loginUser.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload; })

            // logout
            .addCase(logoutUser.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null; })
            .addCase(logoutUser.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; })
            .addCase(logoutUser.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload; });
    },
});

export default authSlice.reducer;
