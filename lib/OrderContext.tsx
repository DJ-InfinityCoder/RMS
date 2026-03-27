import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getOrders, OrderResponse } from '@/api/orderApi';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'CANCELLED' | 'COMPLETED';

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
  restaurantImage?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  timestamp: number;
  scheduledTime: string;
  customerCareNumber?: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  sortOrdersByTime: (ascending?: boolean) => Order[];
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  PENDING: {
    label: 'Pending',
    color: '#3B82F6',
    bg: '#EFF6FF',
    icon: 'receipt-outline',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    icon: 'checkmark-circle-outline',
  },
  PREPARING: {
    label: 'Preparing',
    color: '#F59E0B',
    bg: '#FFFBEB',
    icon: 'restaurant-outline',
  },
  READY: {
    label: 'Ready (Take Away)',
    color: '#22C55E',
    bg: '#F0FDF4',
    icon: 'checkmark-done-outline',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#EF4444',
    bg: '#FEF2F2',
    icon: 'close-circle-outline',
  },
  COMPLETED: {
    label: 'Completed',
    color: '#6B7280',
    bg: '#F3F4F6',
    icon: 'checkmark-done-circle-outline',
  },
};

const mapApiOrderToOrder = (apiOrder: OrderResponse): Order => {
  const restaurant = Array.isArray(apiOrder.restaurant) ? apiOrder.restaurant[0] : apiOrder.restaurant;
  const orderItems = Array.isArray(apiOrder.order_items) ? apiOrder.order_items : [];
  
  let total = 0;
  const items: OrderItem[] = orderItems.map((oi: any) => {
    const dish = Array.isArray(oi.dish) ? oi.dish[0] : oi.dish;
    const itemTotal = (dish?.price || 0) * (oi.quantity || 1);
    total += itemTotal;
    return {
      id: oi.dish?.id || '',
      name: dish?.name || 'Unknown Item',
      price: Number(dish?.price) || 0,
      qty: oi.quantity || 1,
    };
  });

  return {
    id: apiOrder.id,
    orderId: `#RMS${apiOrder.id.slice(0, 8).toUpperCase()}`,
    restaurantId: apiOrder.restaurant_id,
    restaurantName: restaurant?.name || 'Unknown Restaurant',
    items,
    total,
    status: apiOrder.status,
    date: new Date(apiOrder.created_at).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }),
    timestamp: new Date(apiOrder.created_at).getTime(),
    scheduledTime: apiOrder.scheduled_time,
    customerCareNumber: restaurant?.phone || '',
  };
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiOrders = await getOrders();
      const mappedOrders = apiOrders.map(mapApiOrderToOrder);
      setOrders(mappedOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
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
        loading,
        error,
        fetchOrders,
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
