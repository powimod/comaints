import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import STATUS from './status'
import ComaintBackendApiSingleton from '../ComaintApi.js'

const listUnitThunk = createAsyncThunk(
    'unit/list',
    async (_, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            return await comaintApi.unit.listUnit()
        }
        catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


const createUnitThunk = createAsyncThunk(
    'unit/create',
    async ({ unitName }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            return await comaintApi.unit.createUnit({unitName})
        }
        catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


const unitSlice = createSlice({
    name: 'unit',
    initialState: {
        unitList: [],
        selectedUnit : null,
        status: STATUS.IDLE,
        error: null,
    },
    reducers: {
        clearSelectedUnit(state) {
            state.selectedUnit = null
        }
    },
    extraReducers: (builder) => {
        builder

            // getUnitList 
            .addCase(listUnitThunk.pending, (state) => {
                console.log("dOm list unit loading")
                state.status = STATUS.LOADING
                state.error = null
            })
            .addCase(listUnitThunk.fulfilled, (state, action) => {
                console.log("dOm list unit succeeded")
                state.status = STATUS.SUCCEEDED
                state.unitList = action.payload
            })
            .addCase(listUnitThunk.rejected, (state, action) => {
                console.error("thunk unit list failed", action.payload)
                state.status = STATUS.FAILED
                state.error = action.payload
            })


            // createUnit
            .addCase(createUnitThunk.pending, (state) => {
                state.status = STATUS.LOADING
                state.error = null
            })
            .addCase(createUnitThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED
                state.unit = action.payload
            })
            .addCase(createUnitThunk.rejected, (state, action) => {
                console.error("thunk unit create failed", action.payload)
                state.status = STATUS.FAILED
                state.error = action.payload
            })

    }
})

export { listUnitThunk , createUnitThunk }
export default unitSlice.reducer
