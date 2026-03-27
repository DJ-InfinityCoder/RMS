import { supabase } from '@/lib/supabase';

export interface DBVendor {
  id: string;
  name: string;
  description: string | null;
  critic_score: number | null;
  food: string[];
  image_url: string | null;
  tags: string[];
  location: string | null;
  price_range: string | null;
  created_at: string;
}

/**
 * Fetches vendors from the database.
 * Supports search by name or description.
 */
export const getVendors = async (search?: string): Promise<DBVendor[]> => {
  let query = supabase
    .from('vendors')
    .select('*')
    .order('critic_score', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching vendors:', error);
    throw new Error(error.message);
  }

  return (data || []).map(v => ({
    ...v,
    // Ensure array fields are actually arrays (Supabase usually handles this for JSONB/Arrays)
    food: v.food || [],
    tags: v.tags || [],
  }));
};
