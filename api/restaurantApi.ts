import { supabase } from '@/lib/supabase';

export interface DBMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  cooking_method: string | null;
  calories: number | null;
  price: number | null;
  recommended_for: string | null;
  image_url: string | null;
  is_available: boolean;
  category: string;
}

export interface DBRestaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  image_url: string | null; // Note: We might need to add this to the schema or use a default
  rating: number; // Calculated or stored
  deliveryTime: string; // Static for now or calculated
  cuisine: string[]; // From dishes or a new field
}

export const getRestaurants = async (): Promise<DBRestaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  // Transform data to match UI expectations if needed
  return (data || []).map(res => ({
    ...res,
    rating: 4.5, // Fallback if not in DB
    deliveryTime: '25 min', // Fallback
    cuisine: ['Indian', 'Continental'], // Fallback or extract from dishes
    image_url: res.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  }));
};

export const getRestaurantDetails = async (id: string) => {
  const { data: restaurant, error: resError } = await supabase
    .from('restaurants')
    .select(`
      *,
      dishes (*)
    `)
    .eq('id', id)
    .single();

  if (resError) {
    throw new Error(resError.message);
  }

  return restaurant;
};

export const getCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('dishes')
    .select('recommended_for')
    .not('recommended_for', 'is', null);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categories = new Set<string>();
  data.forEach((item: { recommended_for: string | null }) => {
    if (item.recommended_for) {
      item.recommended_for.split(',').forEach((cat: string) => categories.add(cat.trim()));
    }
  });

  return Array.from(categories);
};

export const getTrendingDishes = async (): Promise<DBMenuItem[]> => {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('is_available', true)
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(dish => ({
    ...dish,
    image_url: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  }));
};

export const getOffers = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      restaurant:restaurants(
        id,
        name,
        address
      )
    `)
    .limit(5);

  if (error) {
    return [];
  }

  return data || [];
};

export const getRestaurantCritics = async (restaurantId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
};

export const getRestaurantOffers = async (restaurantId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .gte('valid_to', new Date().toISOString());

  if (error) {
    return [];
  }

  return data || [];
};
