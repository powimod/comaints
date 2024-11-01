import { configureStore } from '@reduxjs/toolkit'
import { ComaintBackendApi } from 'comaint-api-lib'

import contextReducer from './slices/contextSlice'
import authReducer from './slices/authSlice'

const initializeStore = (comaintApi, comaintContext) => {
    const store = configureStore({
        reducer: {
            context: contextReducer,
            auth: authReducer
        },
        middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: { comaintApi, comaintContext }
            }
        }),
    })
    return store
}

export { initializeStore }
