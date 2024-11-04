import { useDispatch, useSelector } from 'react-redux'
import { registerUser, loginUser, logoutUser, validateAuthCode } from '../slices/authSlice'

const useAuthActions = () => {
    const dispatch = useDispatch()
    const authState = useSelector((state) => state.auth)

    const getAuth = () => {
        return authState
    }

    const register = (email, password) => {
        return dispatch(registerUser({email, password}))
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
            console.log("dOm avant logout")
            const result = await dispatch(logoutUser())
            console.log("dOm après logout")
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
        dispatch(validateAuthCode({code}))
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

