import React, { createContext, useContext } from 'react';
import api from './api';

const ApiContext = createContext(api);

export const ApiProvider = ({ children }) => (
    <ApiContext.Provider value={api}>
        {children}
    </ApiContext.Provider>
);

export const useApi = () => useContext(ApiContext);
