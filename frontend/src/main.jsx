import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";

import DialogProvider from  './components/dialog/DialogContext.jsx'

import './i18n'
import createRouter from './router'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <DialogProvider>
            <RouterProvider router={createRouter()} />
        </DialogProvider>
    </StrictMode>
)
