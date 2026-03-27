import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'placed' | 'prepared' | 'ready';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  timestamp: number; // for sorting
  customerCareNumber: string;
}

interface OrderContextType {
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'orderId' | 'status' | 'timestamp'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  sortOrdersByTime: (ascending?: boolean) => Order[];
}

// ─── Status Config ───────────────────────────────────────────────────────────

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  placed: {
    label: 'Placed',
    color: '#3B82F6',
    bg: '#EFF6FF',
    icon: 'receipt-outline',
  },
  prepared: {
    label: 'Prepared',
    color: '#F59E0B',
    bg: '#FFFBEB',
    icon: 'restaurant-outline',
  },
  ready: {
    label: 'Ready (Take Away)',
    color: '#22C55E',
    bg: '#F0FDF4',
    icon: 'checkmark-circle-outline',
  },
};

// ─── Mock Orders ─────────────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderId: '#RMS20260001',
    restaurantId: '1',
    restaurantName: 'Rose Garden Restaurant',
    restaurantImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=70',
    items: [
      { id: 'oi1', name: 'Veg Biryani', price: 220, qty: 1 },
      { id: 'oi2', name: 'Raita', price: 40, qty: 1 },
      { id: 'oi3', name: 'Gulab Jamun', price: 120, qty: 2 },
    ],
    total: 500,
    status: 'placed',
    date: 'Today, 10:45 AM',
    timestamp: Date.now() - 60000 * 30,
    customerCareNumber: '+91 98765 43210',
  },
  {
    id: '2',
    orderId: '#RMS20260002',
    restaurantId: '2',
    restaurantName: 'American Spicy Burger',
    restaurantImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=70',
    items: [
      { id: 'oi4', name: 'Classic Smash Burger', price: 250, qty: 1 },
      { id: 'oi5', name: 'Loaded Fries', price: 180, qty: 1 },
      { id: 'oi6', name: 'Cola Float', price: 120, qty: 1 },
    ],
    total: 550,
    status: 'prepared',
    date: 'Today, 10:20 AM',
    timestamp: Date.now() - 60000 * 55,
    customerCareNumber: '+91 98765 43211',
  },
  {
    id: '3',
    orderId: '#RMS20260003',
    restaurantId: '3',
    restaurantName: 'Pizza Palace',
    restaurantImage: 'https://images.unsplash.com/photo-1548365328-9f547fb09594?w=300&q=70',
    items: [
      { id: 'oi7', name: 'Pepperoni Pizza', price: 450, qty: 1 },
      { id: 'oi8', name: 'Garlic Bread', price: 150, qty: 1 },
    ],
    total: 600,
    status: 'ready',
    date: 'Yesterday, 8:30 PM',
    timestamp: Date.now() - 60000 * 60 * 16,
    customerCareNumber: '+91 98765 43212',
  },
  {
    id: '4',
    orderId: '#RMS20260004',
    restaurantId: '1',
    restaurantName: 'Rose Garden Restaurant',
    restaurantImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=70',
    items: [
      { id: 'oi9', name: 'Dal Makhani', price: 240, qty: 1 },
      { id: 'oi10', name: 'Butter Naan', price: 50, qty: 2 },
      { id: 'oi11', name: 'Mango Lassi', price: 90, qty: 1 },
    ],
    total: 430,
    status: 'ready',
    date: '2 days ago',
    timestamp: Date.now() - 60000 * 60 * 48,
    customerCareNumber: '+91 98765 43210',
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

const OrderContext = createContext<OrderContextType | undefined>(undefined);

let orderCounter = 5;

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const placeOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'orderId' | 'status' | 'timestamp'>): Order => {
      const newOrder: Order = {
        ...orderData,
        id: String(orderCounter++),
        orderId: `#RMS2026${String(orderCounter).padStart(4, '0')}`,
        status: 'placed',
        timestamp: Date.now(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    []
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }, []);

  const getOrdersByStatus = useCallback(
    (status: OrderStatus) => {
      return orders.filter((o) => o.status === status);
    },
    [orders]
  );

  const sortOrdersByTime = useCallback(
    (ascending = false) => {
      return [...orders].sort((a, b) =>
        ascending ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
      );
    },
    [orders]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        updateOrderStatus,
        getOrdersByStatus,
        sortOrdersByTime,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};
