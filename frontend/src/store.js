import { configureStore } from '@reduxjs/toolkit'
import { ComaintBackendApi } from 'comaint-api-lib'

import authReducer from './slices/authSlice'

const initializeStore = (comaintApi ) => {
    if (! (comaintApi instanceof Object))
        throw new Error('Invalid comaintApi argument')
    const store = configureStore({
        reducer: {
            auth: authReducer
        },
        middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: { comaintApi }
            }
        }),
    })
    return store
}

export default initializeStore 
