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
