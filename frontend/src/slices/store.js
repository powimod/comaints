import { configureStore } from '@reduxjs/toolkit'

import authReducer from './authSlice'
import companyReducer from './companySlice'
import unitReducer from './unitSlice'

const initializeStore = () => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            company: companyReducer,
            unit: unitReducer
        }
    })
    return store
}

export default initializeStore 
