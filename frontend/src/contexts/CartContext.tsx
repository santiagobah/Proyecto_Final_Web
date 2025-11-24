'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  prod_id: number;
  name_pr: string;
  sale_price: number;
  quantity: number;
  image_url?: string;
  barcode?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (prod_id: number) => void;
  updateQuantity: (prod_id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('carritoloco_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('carritoloco_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.prod_id === item.prod_id);

      if (existingItem) {
        return prevCart.map(i =>
          i.prod_id === item.prod_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...prevCart, { ...item, quantity }];
    });
  };

  const removeFromCart = (prod_id: number) => {
    setCart(prevCart => prevCart.filter(item => item.prod_id !== prod_id));
  };

  const updateQuantity = (prod_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(prod_id);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.prod_id === prod_id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.sale_price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
