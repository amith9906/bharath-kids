import React, { createContext, useContext } from 'react';

const NotificationContext = createContext({ showNotification: () => {} });

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ showNotification, children }) => (
  <NotificationContext.Provider value={{ showNotification }}>
    {children}
  </NotificationContext.Provider>
);
