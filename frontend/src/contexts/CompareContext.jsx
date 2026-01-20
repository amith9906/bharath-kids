import { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);

  const addToCompare = (item) => {
    setCompareItems((prev) => {
      if (prev.find((i) => i.id === item.id)) {
        return prev;
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromCompare = (itemId) => {
    setCompareItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const isInCompare = (itemId) => {
    return compareItems.some((i) => i.id === itemId);
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const canAddMore = () => {
    return compareItems.length < MAX_COMPARE_ITEMS;
  };

  const value = {
    compareItems,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare,
    canAddMore,
    maxItems: MAX_COMPARE_ITEMS
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};
