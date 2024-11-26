import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import companyReducer from './companySlice';
import userReducer from './userSlice';
import unitReducer from './unitSlice';

const initializeStore = () => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            company: companyReducer,
            user: userReducer,
            unit: unitReducer
        }
    });
    return store;
};

export default initializeStore; 
