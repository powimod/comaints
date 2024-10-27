import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import { Provider } from 'react-redux'
import store from './store'

import DialogProvider from  './components/dialog/DialogContext.jsx'

import './i18n'
import createRouter from './router'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <DialogProvider>
                <RouterProvider router={createRouter()} />
            </DialogProvider>
        </Provider>
    </StrictMode>
)
