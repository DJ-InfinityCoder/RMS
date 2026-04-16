import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';

const USER_SESSION_KEY = 'user_session_id';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  loyalty_points?: number;
  dietary?: string;
  favourite_cuisines?: string[];
}

export interface UserFoodPreference {
  id: string;
  user_id: string;
  ingredient_name: string;
  is_allergy: boolean;
  is_dislike: boolean;
}

export const getStoredUserId = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(USER_SESSION_KEY);
};

export const setStoredUserId = async (userId: string): Promise<void> => {
  await SecureStore.setItemAsync(USER_SESSION_KEY, userId);
};

export const clearStoredSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(USER_SESSION_KEY);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, address, latitude, longitude, loyalty_points, dietary, favourite_cuisines')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<{ full_name: string; email: string; phone: string; address: string; latitude: number; longitude: number }>
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates })
      .eq('id', userId)
      .select('id, full_name, email, phone, address, latitude, longitude, loyalty_points, dietary, favourite_cuisines')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user's location (lat/long) and reverse-geocoded address.
 */
export const updateUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number,
  address: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ latitude, longitude, address })
      .eq('id', userId)
      .select('id, full_name, email, phone, address, latitude, longitude, loyalty_points, dietary, favourite_cuisines')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user location:', error);
    return null;
  }
};

export const getUserFoodPreferences = async (userId: string): Promise<UserFoodPreference[]> => {
  try {
    const { data, error } = await supabase
      .from('user_food_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching food preferences:', error);
    return [];
  }
};

export const updateUserFoodPreferences = async (
  userId: string,
  allergies: string[]
): Promise<void> => {
  try {
    await supabase
      .from('user_food_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('is_allergy', true);

    if (allergies.length > 0) {
      const allergyInserts = allergies.map((ingredient) => ({
        user_id: userId,
        ingredient_name: ingredient,
        is_allergy: true,
        is_dislike: false,
      }));

      await supabase.from('user_food_preferences').insert(allergyInserts);
    }
  } catch (error) {
    console.error('Error updating food preferences:', error);
    throw error;
  }
};

export const addAllergy = async (
  userId: string,
  ingredientName: string
): Promise<UserFoodPreference | null> => {
  try {
    const { data: existing } = await supabase
      .from('user_food_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('ingredient_name', ingredientName)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('user_food_preferences')
      .insert({
        user_id: userId,
        ingredient_name: ingredientName,
        is_allergy: true,
        is_dislike: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding allergy:', error);
    throw error;
  }
};

export const removeAllergy = async (
  userId: string,
  ingredientName: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_food_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('ingredient_name', ingredientName)
      .eq('is_allergy', true);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing allergy:', error);
    throw error;
  }
};

export const getUserOrdersCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting orders count:', error);
    return 0;
  }
};

// ─── Loyalty Points ─────────────────────────────────────────────────────────

export const getUserLoyaltyPoints = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('loyalty_points')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.loyalty_points ?? 0;
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return 0;
  }
};

export const updateUserLoyaltyPoints = async (
  userId: string,
  points: number
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ loyalty_points: points })
      .eq('id', userId)
      .select('loyalty_points')
      .single();

    if (error) throw error;
    return data?.loyalty_points ?? points;
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    throw error;
  }
};

export const addUserLoyaltyPoints = async (
  userId: string,
  pointsToAdd: number
): Promise<number> => {
  try {
    const current = await getUserLoyaltyPoints(userId);
    const newTotal = current + pointsToAdd;
    return await updateUserLoyaltyPoints(userId, newTotal);
  } catch (error) {
    console.error('Error adding loyalty points:', error);
    throw error;
  }
};

export const deductUserLoyaltyPoints = async (
  userId: string,
  pointsToDeduct: number
): Promise<number> => {
  try {
    const current = await getUserLoyaltyPoints(userId);
    const newTotal = Math.max(0, current - pointsToDeduct);
    return await updateUserLoyaltyPoints(userId, newTotal);
  } catch (error) {
    console.error('Error deducting loyalty points:', error);
    throw error;
  }
};
