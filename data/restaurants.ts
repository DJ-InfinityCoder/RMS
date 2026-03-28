import { supabase } from '@/lib/supabase';

// ─── Restaurant Data with Menu Items, Categories, Offers ─────────────────────

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  ingredients: string[];
  allergens: string[];
  category: string;
  image: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface CriticReview {
  id: string;
  name: string;
  credential: string;
  rating: number;
  review: string;
  avatar: string;
  badge: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
}

export interface TableSlot {
  time: string;
  totalSeats: number;
  bookedSeats: number;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  latitude: number;
  longitude: number;
  image: string;
  cuisine: string[];
  description: string;
  phone: string;
  address: string;
  menuItems: MenuItem[];
  reviews: Review[];
  criticReviews: CriticReview[];
  offers: Offer[];
  tableSlots: TableSlot[];
}

// Global cached data
export let restaurants: Restaurant[] = [];

// Helper: Transform Supabase DB data to UI Restaurant interface
const transformDBToRestaurant = (res: any): Restaurant => ({
  id: res.id,
  name: res.name || 'Unknown Restaurant',
  rating: res.rating || 4.5,
  deliveryTime: res.deliveryTime || '25-30 min',
  latitude: res.latitude || 0,
  longitude: res.longitude || 0,
  image: res.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  cuisine: res.cuisine || ['Indian', 'Continental'],
  description: res.description || '',
  phone: res.phone || '',
  address: res.address || '',
  menuItems: (res.dishes || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    description: m.description || '',
    price: m.price || 0,
    calories: m.calories || 0,
    ingredients: [],
    allergens: [],
    category: m.category || 'General',
    image: m.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  })),
  reviews: [],
  criticReviews: [],
  offers: [],
  tableSlots: [],
});

/**
 * Fetch all restaurants from Supabase and update local cache
 */
export const getRestaurantsFromApi = async (): Promise<Restaurant[]> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, dishes(*)')
      .eq('is_active', true);

    if (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }

    restaurants = (data || []).map(transformDBToRestaurant);
    return restaurants;
  } catch (err) {
    console.error("API error in restaurants.ts:", err);
    return [];
  }
};

// Helper: get all unique categories across all restaurants
export const getAllCategories = (data: Restaurant[] = restaurants): string[] => {
  const cats = new Set<string>();
  data.forEach((r) => r.menuItems.forEach((m) => cats.add(m.category)));
  return Array.from(cats);
};

// Helper: search restaurants by item/category name
export const searchByItemOrCategory = (query: string, data: Restaurant[] = restaurants): Restaurant[] => {
  const q = query.toLowerCase().trim();
  if (!q) return data;
  return data.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
      r.menuItems.some(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      )
  );
};
