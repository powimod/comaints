import { useDispatch, useSelector } from 'react-redux'
import { registerUser, loginUser, logoutUser, validateAuthCode } from '../slices/authSlice'

const useAuthActions = () => {
    const dispatch = useDispatch()
    const authState = useSelector((state) => state.auth)

    const getAuth = () => {
        return authState
    }

    const register = (email, password) => {
        try {
            const result = dispatch(registerUser({email, password}))
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

    const validateCode = (code) => {
        try {
            const result = dispatch(validateAuthCode({code}))
            if (validateAuthCode.rejected.match(result)) {
                const errorMessage = result.payload || 'Unknown error' // FIXME translation
                throw new Error(errorMessage)
            }
        }
        catch (error) {
            console.error('Login failed: ', error.message)
            throw error
        }
    }


    return {
        getAuth,
        register,
        login,
        logout,
        validateCode
    }
}

export default useAuthActions

