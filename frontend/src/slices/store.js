import { configureStore } from '@reduxjs/toolkit'

import authReducer from './authSlice'

const initializeStore = () => {
    const store = configureStore({
        reducer: {
            auth: authReducer
        }
    })
    return store
}

export default initializeStore 
