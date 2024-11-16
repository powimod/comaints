import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import STATUS from './status'
import ComaintBackendApiSingleton from '../ComaintApi.js'


export const createUnitThunk = createAsyncThunk(
    'unit/createUnit',
    async ({ unitName }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            return await comaintApi.unit.createUnit({unitName})
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


const unitSlice = createSlice({
    name: 'unit',
    initialState: {
        unit: null,
        unitStatus: STATUS.IDLE,
        unitError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

            // createUnitThunk
            .addCase(createUnitThunk.pending, (state) => {
                state.unitStatus = STATUS.LOADING
                state.unitError = null
            })
            .addCase(createUnitThunk.fulfilled, (state, action) => {
                state.unitStatus = STATUS.SUCCEEDED
                state.unit = action.payload
            })
            .addCase(createUnitThunk.rejected, (state, action) => {
                state.unitStatus = STATUS.FAILED
                state.unitError = action.payload
            })

    }
})

export default unitSlice.reducer
