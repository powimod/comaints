import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import STATUS from './status';
import ComaintBackendApiSingleton from '../ComaintApi.js';

const listUserThunk = createAsyncThunk(
    'user/list',
    async ({page = 1}, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.user.listUser(page);
        }
        catch (error) {
            console.log(error)
            return rejectWithValue(error.message);
        }
    }
);

const getUserByIdThunk = createAsyncThunk(
    'user/getById',
    async ({ userId }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.user.getUserById(userId);
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const createUserThunk = createAsyncThunk(
    'user/create',
    async ({ user }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            return await comaintApi.user.createUser(user);
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const editUserThunk = createAsyncThunk(
    'user/edit',
    async ({ user }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            user = await comaintApi.user.editUser(user);
            return user;
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const deleteUserThunk = createAsyncThunk(
    'user/delete',
    async ({ user }, { rejectWithValue }) => {
        const comaintApi = ComaintBackendApiSingleton.getInstance();
        try {
            await comaintApi.user.deleteUserById(user.id);
            return { user };
        }
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const userSlice = createSlice({
    name: 'user',
    initialState: {
        userList: null,
        selectedUser : null,
        status: STATUS.IDLE,
        error: null,
    },
    reducers: {
        clearSelectedUser(state) {
            state.selectedUser = null;
        }
    },
    extraReducers: (builder) => {
        builder

            // getUserList 
            .addCase(listUserThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(listUserThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                state.userList = action.payload;
            })
            .addCase(listUserThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })

            // getUserById
            .addCase(getUserByIdThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(getUserByIdThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                state.selectedUser = action.payload;
            })
            .addCase(getUserByIdThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })

            // createUser
            .addCase(createUserThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(createUserThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                const newUser = action.payload;
                // update user list to reflect change
                state.selectedUser = newUser;
                state.userList.list.push(newUser);
            })
            .addCase(createUserThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })

            // editUser
            .addCase(editUserThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(editUserThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                const editedUser = action.payload;
                state.selectedUser = editedUser;
                // update user list to reflect change
                state.userList.list = state.userList.list.map(user => user.id === editedUser.id ? editedUser : user);
                /* variante possible : 
                const index = state.userList.list.findIndex((user) => user.id === editedUser.id)
                if (index !== -1) state.userList.list[index] = editedUser
                */
            })
            .addCase(editUserThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            })


             // deleteUser
            .addCase(deleteUserThunk.pending, (state) => {
                state.status = STATUS.LOADING;
                state.error = null;
            })
            .addCase(deleteUserThunk.fulfilled, (state, action) => {
                state.status = STATUS.SUCCEEDED;
                const deletedUser = action.payload.user;
                state.selectedUser = null;
                // update user list to reflect change
                state.userList.list = state.userList.list.filter(user => user.id !== deletedUser.id);
            })
            .addCase(deleteUserThunk.rejected, (state, action) => {
                state.status = STATUS.FAILED;
                state.error = action.payload;
            });
    }
});

export {
    listUserThunk, 
    createUserThunk,
    editUserThunk,
    deleteUserThunk,
    getUserByIdThunk
};
export default userSlice.reducer;
