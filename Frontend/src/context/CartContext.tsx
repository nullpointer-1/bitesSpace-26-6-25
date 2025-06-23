// src/context/CartContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios'; // We'll need axios to fetch shop details to clear by shopId

// Define the shape of the Product as it might appear in the cart for display
interface ProductInCart {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  isVeg: boolean;
  category: string;
  rating: number;
  preparationTime: string;
  shopId: number; // Important: Product from backend MUST include shopId
  shopName?: string; // Optional: If we can fetch/include it easily
}

// Define the shape of the CartContext's value
interface CartContextType {
  cart: Record<number, number>; // { productId: quantity }
  currentShopId: number | null; // ID of the shop whose items are in the cart
  currentShopName: string | null; // Name of the shop
  addToCart: (product: ProductInCart, quantity?: number) => 'added' | 'mismatch' | 'error';
  removeFromCart: (productId: number, quantity?: number) => void;
  clearCart: () => void;
  clearCartAndAddProduct: (product: ProductInCart, quantity?: number) => void; // New function to clear and add
  getCartItemQuantity: (productId: number) => number;
  totalItemsInCart: number; // Convenient derived state
  totalPriceInCart: number; // Convenient derived state
}

// Create the context with a default (null) value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [currentShopId, setCurrentShopId] = useState<number | null>(null);
  const [currentShopName, setCurrentShopName] = useState<string | null>(null);

  // Derive total items and total price (useful for header/summary)
  const totalItemsInCart = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const totalPriceInCart = Object.keys(cart).reduce((sum, productId) => {
    // This is tricky: we don't have product price in context directly.
    // For a real app, you'd store more than just ID/quantity in cart, or
    // fetch prices when needed. For now, we'll assume price data isn't needed
    // directly in the context for this calculation, but will be fetched on CartPage.
    // If you need it here, you'd have to store ProductInCart in `cart` state directly:
    // const [cart, setCart] = useState<Record<number, { product: ProductInCart, quantity: number }>>({});
    // For simplicity, we'll leave total price calculation for CartPage where full item details are fetched.
    return sum; // Placeholder. Actual calculation will be in CartPage.
  }, 0);

  const addToCart = (product: ProductInCart, quantityToAdd: number = 1): 'added' | 'mismatch' | 'error' => {
    if (currentShopId === null) {
      // Cart is empty, add product and set shop ID
      setCart({ [product.id]: quantityToAdd });
      setCurrentShopId(product.shopId);
      setCurrentShopName(product.shopName || null); // Set shop name if available
      return 'added';
    } else if (currentShopId === product.shopId) {
      // Same shop, just update quantity
      setCart(prevCart => {
        const currentQuantity = prevCart[product.id] || 0;
        return {
          ...prevCart,
          [product.id]: currentQuantity + quantityToAdd,
        };
      });
      return 'added';
    } else {
      // Different shop, return mismatch status
      return 'mismatch';
    }
  };

  const clearCartAndAddProduct = (product: ProductInCart, quantityToAdd: number = 1) => {
    setCart({ [product.id]: quantityToAdd });
    setCurrentShopId(product.shopId);
    setCurrentShopName(product.shopName || null);
  };

  const removeFromCart = (productId: number, quantityToRemove: number = 1) => {
    setCart(prevCart => {
      const currentQuantity = prevCart[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity - quantityToRemove);
      if (newQuantity === 0) {
        const newCart = { ...prevCart };
        delete newCart[productId];
        // If cart becomes empty, reset currentShopId and currentShopName
        if (Object.keys(newCart).length === 0) {
          setCurrentShopId(null);
          setCurrentShopName(null);
        }
        return newCart;
      }
      return {
        ...prevCart,
        [productId]: newQuantity,
      };
    });
  };

  const clearCart = () => {
    setCart({});
    setCurrentShopId(null);
    setCurrentShopName(null);
  };

  const getCartItemQuantity = (productId: number): number => {
    return cart[productId] || 0;
  };

  // Re-calculate totalPriceInCart if product prices were stored in cart state
  // For now, let's keep totalPriceInCart as 0, or derive it from CartPage where we have full product details.
  // If you want price here, your cart state needs to store more than just quantity.

  const contextValue: CartContextType = {
    cart,
    currentShopId,
    currentShopName,
    addToCart,
    removeFromCart,
    clearCart,
    clearCartAndAddProduct,
    getCartItemQuantity,
    totalItemsInCart,
    totalPriceInCart: 0, // Placeholder
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};