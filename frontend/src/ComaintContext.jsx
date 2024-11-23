import React, { createContext, useState, useEffect, useRef } from 'react';
import ComaintBackendApiSingleton from './ComaintApi.js';

const ComaintContext = createContext(null);

const ComaintContextProvider = ({ children }) => {

    const [comaintContext, setComaintContext] = useState(null);

    useEffect(() => {
        const contextInfoCallback = (newContext) => {
            setComaintContext((prevContext) => ({...newContext}));
        };
        const comaintBackendApi = ComaintBackendApiSingleton.getInstance();
        comaintBackendApi.setContextInfoCallback(contextInfoCallback);
    }, []);

    return (
        <ComaintContext.Provider value={{ comaintContext }}>
            {children}
        </ComaintContext.Provider>
    );
};

const useComaintContext = () => {
    const comaintContext = React.useContext(ComaintContext);
    return comaintContext;
};

export { ComaintContext , useComaintContext };
export default ComaintContextProvider;

