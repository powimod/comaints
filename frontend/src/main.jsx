import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import createRouter from './router'
import { Provider } from 'react-redux'
import './i18n.js'

import ComaintApiProvider, { initializeComaintApi } from './ComaintApi.jsx'
import { initializeStore } from './store'
import DialogProvider from  './components/dialog/DialogContext.jsx'

const Main = () => {
    const [ comaintContext, setComaintContext ] = useState(null)
    const comaintApi = initializeComaintApi(setComaintContext)
    const store = initializeStore(comaintApi, comaintContext)

    /* TODO cleanup
    useEffect( () => {
        console.log("dOm modification contexte", comaintContext)
    }, [comaintContext])
    */

    return (
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
}

createRoot(document.getElementById('root')).render(
    <Main/>
)
