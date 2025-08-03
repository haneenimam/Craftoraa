import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ✅ Restore cart from backup if user was redirected back without completing payment
  useEffect(() => {
    const backup = localStorage.getItem("backupCart");

    if (backup && cart.length === 0) {
      setCart(JSON.parse(backup));
      localStorage.removeItem("backupCart");
    }
  }, []);

  const addToCart = (product) => {
    const productId = product._id || product.id;
    const stock = product.inStock ?? product.instock ?? product.stock ?? Infinity;

    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) => (item._id || item.id) === productId
      );

      if (existingProduct) {
        if ((existingProduct.quantity || 1) >= stock) return prevCart;

        return prevCart.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((product) => (product._id || product.id) !== productId)
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if ((item._id || item.id) === productId) {
          const stock = item.inStock ?? item.instock ?? item.stock ?? Infinity;
          const validQuantity = Math.min(Math.max(newQuantity, 1), stock);
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return cart
      .reduce(
        (total, product) =>
          total + (Number(product.price) || 0) * (product.quantity || 1),
        0
      )
      .toFixed(2);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
