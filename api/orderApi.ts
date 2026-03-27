import { supabase } from '@/lib/supabase';
import { getStoredUserId } from './userApi';

export interface OrderItem {
  dish_id: string;
  quantity: number;
}

export interface TakeawayOrderRequest {
  restaurantId: string;
  items: OrderItem[];
  scheduledTime: Date;
}

export interface OrderResponse {
  id: string;
  restaurant_id: string;
  user_id: string;
  dining_option: 'PICKUP';
  scheduled_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  restaurant?: {
    name: string;
    address: string;
    phone: string;
  }[] | null;
  order_items?: {
    dish: {
      name: string;
      price: number;
    }[] | null;
    quantity: number;
  }[] | null;
}

export const getOrders = async (): Promise<OrderResponse[]> => {
  const userId = await getStoredUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      restaurant_id,
      user_id,
      dining_option,
      scheduled_time,
      status,
      created_at,
      restaurant:restaurants(
        name,
        address,
        phone
      ),
      order_items(
        dish:dishes(
          name,
          price
        ),
        quantity
      )
    `)
    .eq('user_id', userId)
    .gt('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const createTakeawayOrder = async (
  orderData: TakeawayOrderRequest
): Promise<OrderResponse> => {
  const userId = await getStoredUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const orderItems = orderData.items.map((item) => ({
    dish_id: item.dish_id,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      restaurant_id: orderData.restaurantId,
      dining_option: 'PICKUP',
      scheduled_time: orderData.scheduledTime.toISOString(),
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  for (const item of orderItems) {
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: data.id,
        dish_id: item.dish_id,
        quantity: item.quantity,
      });

    if (itemError) {
      throw new Error(itemError.message);
    }
  }

  return data;
};

export interface RestaurantCartItem {
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
  items: RestaurantCartItem[];
  scheduledTime: Date | null;
}

export const createMultipleTakeawayOrders = async (
  restaurantCarts: RestaurantCart[]
): Promise<OrderResponse[]> => {
  const orders: OrderResponse[] = [];

  for (const cart of restaurantCarts) {
    if (!cart.scheduledTime) {
      throw new Error(`Please select a pickup time for ${cart.restaurantName}`);
    }

    const items: OrderItem[] = cart.items.map((item) => ({
      dish_id: item.id,
      quantity: item.qty,
    }));

    const order = await createTakeawayOrder({
      restaurantId: cart.restaurantId,
      items,
      scheduledTime: cart.scheduledTime,
    });

    orders.push(order);
  }

  return orders;
};

export const getOrderById = async (orderId: string): Promise<OrderResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        restaurant_id,
        user_id,
        dining_option,
        scheduled_time,
        status,
        created_at,
        restaurant:restaurants(
          name,
          address,
          phone
        ),
        order_items(
          dish:dishes(
            name,
            price
          ),
          quantity
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};
