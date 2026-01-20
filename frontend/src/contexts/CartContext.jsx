import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Initialize cart from localStorage
const getInitialCart = () => {
  if (typeof window === 'undefined') return [];
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem('cart');
      return [];
    }
  }
  return [];
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getInitialCart);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (item) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const decreaseItem = (itemId) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      if (item.quantity <= 1) {
        return prev.filter((i) => i.id !== itemId);
      }
      return prev.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    return item?.quantity || 0;
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const itemSubtotal = parseFloat(item.price) * item.quantity;
      const discountPercent = parseFloat(item.discountPercent) || 0;
      const discountAmount = (itemSubtotal * discountPercent) / 100;
      const taxableAmount = itemSubtotal - discountAmount;

      const igstRate = parseFloat(item.igstRate) || 0;
      const cgstRate = parseFloat(item.cgstRate) || 0;
      const sgstRate = parseFloat(item.sgstRate) || 0;

      const itemTax = (taxableAmount * (igstRate + cgstRate + sgstRate)) / 100;

      subtotal += itemSubtotal;
      discountTotal += discountAmount;
      taxTotal += itemTax;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
    };
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totals = calculateTotals();

  const value = {
    items,
    addItem,
    decreaseItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    itemCount,
    ...totals
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
