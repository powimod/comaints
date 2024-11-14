import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import STATUS from './status'
import ComaintBackendApiSingleton from '../ComaintApi.js'


export const initializeCompanyThunk = createAsyncThunk(
    'company/initializeCompany',
    async ({ companyName }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            return await comaintApi.company.initializeCompany({companyName})
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


const companySlice = createSlice({
    name: 'company',
    initialState: {
        company: null,
        companyStatus: STATUS.IDLE,
        companyError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

            // initializeCompanyThunk
            .addCase(initializeCompanyThunk.pending, (state) => {
                state.companyStatus = STATUS.LOADING
                state.companyError = null
            })
            .addCase(initializeCompanyThunk.fulfilled, (state, action) => {
                state.companyStatus = STATUS.SUCCEEDED
                state.company = action.payload
            })
            .addCase(initializeCompanyThunk.rejected, (state, action) => {
                state.companyStatus = STATUS.FAILED
                state.companyError = action.payload
            })

    }
})

export default companySlice.reducer
