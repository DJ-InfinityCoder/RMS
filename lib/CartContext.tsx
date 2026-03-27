import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { storage } from './storage';

const CART_STORAGE_KEY = 'rms_cart_items';
const SCHEDULE_STORAGE_KEY = 'rms_scheduled_times';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  restaurantId: string;
  restaurantName: string;
}

export interface RestaurantCart {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  scheduledTime: Date | null;
}

type CartContextType = {
  items: CartItem[];
  getGroupedByRestaurant: () => RestaurantCart[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (id: string) => void;
  updateItemQty: (id: string, qty: number) => void;
  setScheduledTime: (restaurantId: string, time: Date) => void;
  clearCart: () => void;
  clearRestaurantItems: (restaurantId: string) => void;
  getItemQty: (id: string) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [scheduledTimes, setScheduledTimes] = useState<Record<string, Date>>({});
  const [loaded, setLoaded] = useState(false);

  // ─── Load cart from storage on mount ─────────────────────────────────────
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedItems = await storage.getItem(CART_STORAGE_KEY);
        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }
        const savedSchedule = await storage.getItem(SCHEDULE_STORAGE_KEY);
        if (savedSchedule) {
          const parsed = JSON.parse(savedSchedule);
          const hydrated: Record<string, Date> = {};
          for (const key of Object.keys(parsed)) {
            hydrated[key] = new Date(parsed[key]);
          }
          setScheduledTimes(hydrated);
        }
      } catch (e) {
        console.log('Cart load error:', e);
      } finally {
        setLoaded(true);
      }
    };
    loadCart();
  }, []);

  // ─── Persist cart on changes ────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (!loaded) return;
    storage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(scheduledTimes));
  }, [scheduledTimes, loaded]);

  const getGroupedByRestaurant = useCallback((): RestaurantCart[] => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          items: [],
          scheduledTime: null,
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {} as Record<string, RestaurantCart>);

    return Object.values(grouped).map((group) => ({
      ...group,
      scheduledTime: scheduledTimes[group.restaurantId] || null,
    }));
  }, [items, scheduledTimes]);

  const addItem = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const exist = prev.find((p) => p.id === item.id);
      if (exist) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateItemQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
    }
  }, []);

  const setScheduledTime = useCallback((restaurantId: string, time: Date) => {
    setScheduledTimes((prev) => ({ ...prev, [restaurantId]: time }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setScheduledTimes({});
  }, []);

  const clearRestaurantItems = useCallback((restaurantId: string) => {
    setItems((prev) => prev.filter((p) => p.restaurantId !== restaurantId));
    setScheduledTimes((prev) => {
      const updated = { ...prev };
      delete updated[restaurantId];
      return updated;
    });
  }, []);

  const getItemQty = useCallback((id: string): number => {
    const item = items.find((p) => p.id === id);
    return item ? item.qty : 0;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        getGroupedByRestaurant,
        addItem,
        removeItem,
        updateItemQty,
        setScheduledTime,
        clearCart,
        clearRestaurantItems,
        getItemQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
