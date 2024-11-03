import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import STATUS from './status'
import ComaintBackendApiSingleton from '../ComaintApi.js'


export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ email, password }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            return await comaintApi.auth.register({email, password})
        } catch (error) {
            console.error('Registration failed: ', error.message)
            return rejectWithValue(error.message || 'Registration failed')
        }
    }
)

export const validateAuthCode = createAsyncThunk(
    'auth/validateAuthCode',
    async ({ code }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            return await comaintApi.auth.validate({ code })
        } catch (error) {
            console.error('Auth code validation failed: ', error.message)
            return rejectWithValue(error.message || 'Auth code validation')
        }
    }

)

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue, getState }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            await comaintApi.auth.login(email, password)
        } catch (error) {
            return rejectWithValue(error.message || 'Login failed')
        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            await comaintApi.auth.logout()
        } catch (error) {
            console.error('Logout failed: ', error)
            return rejectWithValue(error.message || 'Logout failed')
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        authStatus: STATUS.IDLE,
        authError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // registration
            .addCase(registerUser.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null })
            .addCase(registerUser.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; state.isAuthenticated = true })
            .addCase(registerUser.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload })

            // auth code validation
            .addCase(validateAuthCode.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null })
            .addCase(validateAuthCode.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; state.isAuthenticated = true })
            .addCase(validateAuthCode.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload })

            // login
            .addCase(loginUser.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null })
            .addCase(loginUser.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; state.isAuthenticated = true })
            .addCase(loginUser.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload })

            // logout
            .addCase(logoutUser.pending,   (state) => { state.authStatus = STATUS.LOADING; state.authError = null })
            .addCase(logoutUser.fulfilled, (state) => { state.authStatus = STATUS.SUCCEEDED; state.isAuthenticated = false })
            .addCase(logoutUser.rejected,  (state, action) => { state.authStatus = STATUS.FAILED; state.authError = action.payload })
    },
})

export default authSlice.reducer
