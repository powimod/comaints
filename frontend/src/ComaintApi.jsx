import React, { createContext, useContext } from 'react';
import { ComaintBackendApi } from 'comaint-api-lib'

const ApiContext = createContext(null)

const useComaintApi = () => useContext(ApiContext)

const initializeComaintApi = (setComaintContext) => {

    const contextInfoCallback = (context) => {
        console.log("Context update", context)
        setComaintContext(context) // update commaint context state in main.jsx
    }

    const accountSerializeFunction = (data) => {
        const accountStorageKey = 'account'
        if (data === undefined) {
            // load account from local storage
            const accountData = localStorage.getItem(accountStorageKey)
            data = JSON.parse(accountData)
        }
        else {
            // save account to local storage
            const accountData = JSON.stringify(data)
            localStorage.setItem(accountStorageKey, accountData)
        }
        return data
    }
    const apiUrl = window.location.origin
    const comaintApi = new ComaintBackendApi(apiUrl, contextInfoCallback, accountSerializeFunction)
    return comaintApi
}

const ComaintApiProvider = ({comaintApi, comaintContext, children}) => {
    return (
        <ApiContext.Provider value={ {comaintApi, comaintContext} }>
            {children}
        </ApiContext.Provider>
    )
}

export { useComaintApi, initializeComaintApi  }
export default ComaintApiProvider