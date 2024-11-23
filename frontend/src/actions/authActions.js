import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser, logoutUser, validateAuthCode, authResetPassword, resendAuthCode } from '../slices/authSlice';

const useAuthActions = () => {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    const getAuth = () => {
        return authState;
    };

    const register = async (email, password) => {
        try {
            return await dispatch(registerUser({email, password})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const login = async (email, password) => {
        try {
            return await dispatch(loginUser({email, password})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            return await dispatch(logoutUser()).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const validateCode = async (code) => {
        try {
            return await dispatch(validateAuthCode({code})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const validateCodeWithEmail = async (email, code) => {
        try {
            return await dispatch(validateAuthCode({email, code})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const resendCodeWithEmail = async (email) => {
        try {
            return await dispatch(resendAuthCode({email})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };
 
    const resetPassword = async (email, password) => {
        try {
            await dispatch(authResetPassword({email, password})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    return {
        getAuth,
        register,
        login,
        logout,
        validateCode,
        validateCodeWithEmail,
        resendCodeWithEmail,
        resetPassword,
    };
};

export default useAuthActions;

