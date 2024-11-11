import { useDispatch, useSelector } from 'react-redux'
import { registerUser, loginUser, logoutUser, validateAuthCode, authResetPassword, resendAuthCode } from '../slices/authSlice'

const useAuthActions = () => {
    const dispatch = useDispatch()
    const authState = useSelector((state) => state.auth)

    const getAuth = () => {
        return authState
    }

    const register = async (email, password) => {
        try {
            const result = await dispatch(registerUser({email, password}))
            if (registerUser.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Login failed: ', error.message)
            throw error
        }

    }

    const login = async (email, password) => {
        try {
            const result = await dispatch(loginUser({email, password}))
            if (loginUser.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Login failed: ', error.message)
            throw error
        }
    }

    const logout = async () => {
        try {
            const result = await dispatch(logoutUser())
            if (logoutUser.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Login failed: ', error.message)
            throw error
        }
    }

    const validateCode = async (code) => {
        try {
            const result = await dispatch(validateAuthCode({code}))
            if (validateAuthCode.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Code validation failed: ', error.message)
            throw error
        }
    }

    const validateCodeWithEmail = async (email, code) => {
        try {
            const result = await dispatch(validateAuthCode({email, code}))
            if (validateAuthCode.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Code validation failed: ', error.message)
            throw error
        }
    }

    const resendCodeWithEmail = async (email) => {
        try {
            const result = await dispatch(resendAuthCode({email}))
            if (resendAuthCode.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Can not resend code: ', error.message)
            throw error
        }
    }
 
    const resetPassword = async (email, password) => {
        try {
            const result = await dispatch(authResetPassword({email, password}))
            if (authResetPassword.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Reset password failed: ', error.message)
            throw error
        }
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

