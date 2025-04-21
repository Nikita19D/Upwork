import React, { createContext, useContext, useState } from 'react';

// Create a context for the global state
const AppContext = createContext(null);

// Create a provider component
export const AppProvider = ({ children }) => {
    const [state, setState] = useState({
        // Define your global state here
    });

    return (
        <AppContext.Provider value={{ state, setState }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
    return useContext(AppContext);
};