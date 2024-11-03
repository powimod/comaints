import React, { createContext, useState, useEffect, useRef } from 'react';
import { ComaintBackendApi } from 'comaint-api-lib';

const ComaintContext = createContext(null);

const ComaintProvider = ({ children }) => {
    const comaintApiRef = useRef(null)
    const [comaintContext, setComaintContext] = useState({ email: null, connected: false });
    const [apiInitError, setApiInitError] = useState(false);
    const [isApiReady, setIsApiReady] = useState(false)

    useEffect(() => {
        try {
            const apiUrl = window.location.origin;

            const contextInfoCallback = (newContext) => {
                console.log("Context update", newContext);
                setComaintContext((prevContext) => {
                    const updatedContext = { ...prevContext, ...newContext }
                    console.log("dOm update context state", updatedContext)
                    return  updatedContext
                });
            };

            const accountSerializeFunction = (data) => {
                const accountStorageKey = 'account';
                if (data === undefined) {
                    const accountData = localStorage.getItem(accountStorageKey);
                    data = JSON.parse(accountData);
                } else {
                    const accountData = JSON.stringify(data);
                    localStorage.setItem(accountStorageKey, accountData);
                }
                return data;
            };

            comaintApiRef.current = new ComaintBackendApi(apiUrl, contextInfoCallback, accountSerializeFunction);
            setIsApiReady(true);
        } catch (error) {
            console.error("Error during ComaintBackendApi initialization:", error.message);
            setApiInitError(true);
        }
    }, [])

    return (
        <ComaintContext.Provider value={{ isApiReady, comaintContext, comaintApi: comaintApiRef.current }}>
            {apiInitError ? <div>Loading error</div> : children}
        </ComaintContext.Provider>
    );
};

const useComaintContext = () => {
    const comaintContext = React.useContext(ComaintContext);
    if (comaintContext === undefined) {
        throw new Error('useComaintContext must be used within a ComaintProvider');
    }
    return comaintContext;
};

export { ComaintContext , useComaintContext };
export default ComaintProvider;

