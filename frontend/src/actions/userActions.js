import { useDispatch, useSelector } from 'react-redux';
import { listUserThunk, createUserThunk, getUserByIdThunk, editUserThunk, deleteUserThunk } from '../slices/userSlice';
import { controlObject } from '@common/objects/object-util.mjs';
import userObjectDef from '@common/objects/user-object-def.mjs';
import { ComaintTranslatedError } from '@common/error.mjs';

const useUserActions = () => {
    const dispatch = useDispatch();
    const selectedUser = useSelector((state) => state.user.selectedUser);
    const userList = useSelector((state) => state.user.userList);

    const createUser = async (user) => {
        const [ errorMsg, errorParams ] = (controlObject(userObjectDef, user, {fullCheck:false}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        try {
            return await dispatch(createUserThunk({user})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const editUser = async (user) => {
        const [ errorMsg, errorParams ] = (controlObject(userObjectDef, user, {fullCheck:true}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        try {
            return await dispatch(editUserThunk({user})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const deleteUser = async (user) => {
        const [ errorMsg, errorParams ] = (controlObject(userObjectDef, user, {fullCheck:true}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        try {
            return await dispatch(deleteUserThunk({user})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };


    const updateUserList = async (page = 1) => {
        try {
            return await dispatch(listUserThunk({page})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const getUserById = async (userId) => {
        try {
            const user = await dispatch(getUserByIdThunk({userId})).unwrap();
            return user;
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    return {
        selectedUser,
        userList,
        createUser,
        editUser,
        deleteUser,
        updateUserList,
        getUserById,
    };
};

export default useUserActions;

