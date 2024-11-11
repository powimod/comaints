import { useDispatch, useSelector } from 'react-redux'
import { registerUser, loginUser, logoutUser, validateAuthCode, authResetPassword, resendAuthCode } from '../slices/authSlice'

const useAuthActions = () => {
    const dispatch = useDispatch()
    const authState = useSelector((state) => state.auth)

    const getAuth = () => {
        return authState
    }

    const register = async (email, password) => {
        const result = await dispatch(registerUser({email, password}))
        if (registerUser.rejected.match(result)) 
            throw new Error(result.payload)
    }

    const login = async (email, password) => {
        const result = await dispatch(loginUser({email, password}))
        if (loginUser.rejected.match(result)) 
            throw new Error(result.payload)
    }

    const logout = async () => {
        const result = await dispatch(logoutUser())
        if (logoutUser.rejected.match(result))
            throw new Error(result.payload)
    }

    const validateCode = async (code) => {
        const result = await dispatch(validateAuthCode({code}))
        if (validateAuthCode.rejected.match(result))
            throw new Error(result.payload)
    }

    const validateCodeWithEmail = async (email, code) => {
        const result = await dispatch(validateAuthCode({email, code}))
        if (validateAuthCode.rejected.match(result))
            throw new Error(result.payload)
    }

    const resendCodeWithEmail = async (email) => {
        const result = await dispatch(resendAuthCode({email}))
        if (resendAuthCode.rejected.match(result)) 
            throw new Error(result.payload)
    }
 
    const resetPassword = async (email, password) => {
        const result = await dispatch(authResetPassword({email, password}))
        if (authResetPassword.rejected.match(result))
            throw new Error(result.payload)
    }

    return {
        getAuth,
        register,
        login,
        logout,
        validateCode,
        validateCodeWithEmail,
        resendCodeWithEmail,
        resetPassword,
    }
}

export default useAuthActions

