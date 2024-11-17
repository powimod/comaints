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

const getUnitByIdThunk = createAsyncThunk(
    'unit/getById',
    async ({ unitId }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            return await comaintApi.unit.getUnitById(unitId)
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

const editUnitThunk = createAsyncThunk(
    'unit/edit',
    async ({ unit }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance()
        try {
            unit = await comaintApi.unit.editUnit(unit)
            console.log("dOm success")
            return unit
        }
        catch (error) {
            console.log("dOm erreur", error)
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

            // getUnitById
            .addCase(getUnitByIdThunk.pending, (state) => {
                state.status = STATUS.LOADING
                state.error = null
            })
            .addCase(getUnitByIdThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED
                state.selectedUnit = action.payload
            })
            .addCase(getUnitByIdThunk.rejected, (state, action) => {
                console.error("thunk unit get failed", action.payload)
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
                const newUnit = action.payload
                // update unit list to reflect unit change
                state.unit = newUnit
                state.unitList.push(newUnit)
            })
            .addCase(createUnitThunk.rejected, (state, action) => {
                console.error("thunk unit create failed", action.payload)
                state.status = STATUS.FAILED
                state.error = action.payload
            })

            // editUnit
            .addCase(editUnitThunk.pending, (state) => {
                state.status = STATUS.LOADING
                state.error = null
            })
            .addCase(editUnitThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED
                const editedUnit = action.payload
                state.unit = editedUnit
                // update unit list to reflect unit change
                state.unitList = state.unitList.map(unit => unit.id === editedUnit.id ? editedUnit : unit)
                /* 
                const index = state.unitList.findIndex((unit) => unit.id === editedUnit.id)
                if (index !== -1) state.unitList[index] = editedUnit
                */
            })
            .addCase(editUnitThunk.rejected, (state, action) => {
                console.error("thunk unit edit failed", action.payload)
                state.status = STATUS.FAILED
                state.error = action.payload
            })

 
    }
})

export {
    listUnitThunk, 
    createUnitThunk,
    editUnitThunk,
    getUnitByIdThunk
}
export default unitSlice.reducer
