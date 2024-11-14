import { configureStore } from '@reduxjs/toolkit'

import authReducer from './authSlice'
import companyReducer from './companySlice'

const initializeStore = () => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            company: companyReducer
        }
    })
    return store
}

export default initializeStore 
