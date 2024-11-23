import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import STATUS from './status';
import ComaintBackendApiSingleton from '../ComaintApi.js';

const listUnitThunk = createAsyncThunk(
    'unit/list',
    async ({page = 1}, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.unit.listUnit(page);
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const getUnitByIdThunk = createAsyncThunk(
    'unit/getById',
    async ({ unitId }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.unit.getUnitById(unitId);
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const createUnitThunk = createAsyncThunk(
    'unit/create',
    async ({ unit }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.unit.createUnit(unit);
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const editUnitThunk = createAsyncThunk(
    'unit/edit',
    async ({ unit }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            unit = await comaintApi.unit.editUnit(unit);
            return unit;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const deleteUnitThunk = createAsyncThunk(
    'unit/delete',
    async ({ unit }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            await comaintApi.unit.deleteUnitById(unit.id);
            return { unit };
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const unitSlice = createSlice({
    name: 'unit',
    initialState: {
        unitList: null,
        selectedUnit : null,
        status: STATUS.IDLE,
        error: null,
    },
    reducers: {
        clearSelectedUnit(state) {
            state.selectedUnit = null;
        }
    },
    extraReducers: (builder) => {
        builder

            // getUnitList 
            .addCase(listUnitThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(listUnitThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                state.unitList = action.payload;
            })
            .addCase(listUnitThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })

            // getUnitById
            .addCase(getUnitByIdThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(getUnitByIdThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                state.selectedUnit = action.payload;
            })
            .addCase(getUnitByIdThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })

            // createUnit
            .addCase(createUnitThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(createUnitThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                const newUnit = action.payload;
                // update unit list to reflect change
                state.selectedUnit = newUnit;
                state.unitList.list.push(newUnit);
            })
            .addCase(createUnitThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })

            // editUnit
            .addCase(editUnitThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(editUnitThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                const editedUnit = action.payload;
                state.selectedUnit = editedUnit;
                // update unit list to reflect change
                state.unitList.list = state.unitList.list.map(unit => unit.id === editedUnit.id ? editedUnit : unit);
                /* variante possible : 
                const index = state.unitList.list.findIndex((unit) => unit.id === editedUnit.id)
                if (index !== -1) state.unitList.list[index] = editedUnit
                */
            })
            .addCase(editUnitThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })


             // deleteUnit
            .addCase(deleteUnitThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(deleteUnitThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                const deletedUnit = action.payload.unit;
                state.selectedUnit = null;
                // update unit list to reflect change
                state.unitList.list = state.unitList.list.filter(unit => unit.id !== deletedUnit.id);
            })
            .addCase(deleteUnitThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            });
    }
});

export {
    listUnitThunk, 
    createUnitThunk,
    editUnitThunk,
    deleteUnitThunk,
    getUnitByIdThunk
};
export default unitSlice.reducer;
