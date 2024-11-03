import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import './i18n.js'


import DialogProvider from  './components/dialog/DialogContext.jsx'
import ComaintContextProvider, { useComaintContext } from './ComaintContext.jsx'

import { RouterProvider } from 'react-router-dom'
import initializeStore from './store.js'
import createRouter from './router'

const Main = () => {
    const store = initializeStore()
    return (
        <StrictMode>
            <ComaintContextProvider>
                <ReduxProvider store={store}>
                    <DialogProvider>
                        <RouterProvider router={createRouter()} />
                    </DialogProvider>
                </ReduxProvider>
            </ComaintContextProvider>
        </StrictMode>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main/>)

