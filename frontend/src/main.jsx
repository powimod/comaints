import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import './i18n.js'


import DialogProvider from  './components/dialog/DialogContext.jsx'
import ComaintProvider, { useComaintContext } from './ComaintContext.jsx'

import { RouterProvider } from 'react-router-dom'
import initializeStore from './store.js'
import createRouter from './router'

const InternalComponent = () => {
    const { comaintApi, isApiReady } = useComaintContext(); // On récupère `comaintApi` depuis le contexte

    if (! isApiReady)
        return <div>Loading Comaint API</div> // FIXME translation

    const store = initializeStore(comaintApi)

    return (
        <StrictMode>
            <ReduxProvider store={store}>
                <DialogProvider>
                    <RouterProvider router={createRouter()} />
                </DialogProvider>
            </ReduxProvider>
        </StrictMode>
    )
}

const Main = () => {
    return (
        <ComaintProvider>
            <InternalComponent/>
        </ComaintProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main/>)

