import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import createRouter from './router'
import { Provider } from 'react-redux'
import './i18n'

import ComaintApiProvider, { initializeComaintApi } from './ComaintApi.jsx'
import { initializeStore } from './store'
import DialogProvider from  './components/dialog/DialogContext.jsx'


const [ comaintApi, comaintContext ] = initializeComaintApi()
const store = initializeStore(comaintApi, comaintContext)

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <ComaintApiProvider comaintApi={comaintApi} comaintContext={comaintContext}>
                <DialogProvider>
                    <RouterProvider router={createRouter()} />
                </DialogProvider>
            </ComaintApiProvider>
        </Provider>
    </StrictMode>
)
