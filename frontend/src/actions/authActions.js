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

    const login = (email, password) => {
        return dispatch(loginUser({email, password}))
    }

    const logout = () => {
        dispatch(logoutUser())
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

