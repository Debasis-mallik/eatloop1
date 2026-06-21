import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eatloop_cart')) || []; } catch { return []; }
  });
  const [restaurantId, setRestaurantId] = useState(() => localStorage.getItem('eatloop_cart_restaurant') || null);
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    localStorage.setItem('eatloop_cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item, restaurant) => {
    if (restaurantId && restaurantId !== restaurant._id && items.length > 0) {
      if (!window.confirm(`Your cart has items from ${restaurantName}. Clear cart and add from ${restaurant.name}?`)) return false;
      setItems([]);
    }
    if (!restaurantId || restaurantId !== restaurant._id) {
      setRestaurantId(restaurant._id);
      setRestaurantName(restaurant.name);
      localStorage.setItem('eatloop_cart_restaurant', restaurant._id);
    }
    setItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        toast.success('Added one more!');
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`${item.name} added to cart`);
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  }, [restaurantId, restaurantName, items]);

  const removeItem = useCallback((itemId) => {
    setItems(prev => {
      const updated = prev.filter(i => i._id !== itemId);
      if (updated.length === 0) { setRestaurantId(null); localStorage.removeItem('eatloop_cart_restaurant'); }
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((itemId, qty) => {
    if (qty === 0) { removeItem(itemId); return; }
    setItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName('');
    localStorage.removeItem('eatloop_cart');
    localStorage.removeItem('eatloop_cart_restaurant');
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.discountedPrice || i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, restaurantName, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
