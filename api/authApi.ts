import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import * as SecureStore from 'expo-secure-store';

const SALT_ROUNDS = 10;
const USER_SESSION_KEY = 'user_session_id';

export { getStoredUserId, setStoredUserId, clearStoredSession } from './userApi';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
  role?: 'customer' | 'restaurant';
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { email, password } = credentials;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('DB error (users):', userError.message);
      return { success: false, error: 'Database error. Please try again.' };
    }

    let targetData = userData;
    let role: 'customer' | 'restaurant' = 'customer';

    if (!targetData) {
      const { data: restData, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (restError) {
        console.error('DB error (restaurants):', restError.message);
        return { success: false, error: 'Database error. Please try again.' };
      }

      if (restData) {
        targetData = restData;
        role = 'restaurant';
      }
    }

    if (!targetData) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isPasswordCorrect = await bcrypt.compare(password, targetData.password_hash);
    if (!isPasswordCorrect) {
      return { success: false, error: 'Invalid email or password' };
    }

    await SecureStore.setItemAsync(USER_SESSION_KEY, targetData.id);

    const { password_hash, ...safeUser } = targetData;
    return {
      success: true,
      user: safeUser,
      role,
    };
  } catch (error: any) {
    console.error('Login exception:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
};

export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const { name, email, password } = data;

    if (!name || !email || !password) {
      return { success: false, error: 'Name, email, and password are required' };
    }

    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('DB check error:', checkError.message);
      return { success: false, error: 'Database error. Please try again.' };
    }

    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: name,
        email: email,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError.message);
      return { success: false, error: 'Could not create account: ' + insertError.message };
    }

    await SecureStore.setItemAsync(USER_SESSION_KEY, newUser.id);

    const { password_hash, ...safeUser } = newUser;
    return {
      success: true,
      user: safeUser,
      role: 'customer',
    };
  } catch (error: any) {
    console.error('SignUp exception:', error);
    return { success: false, error: error.message || 'Signup failed' };
  }
};

export const logout = async (): Promise<AuthResponse> => {
  try {
    await SecureStore.deleteItemAsync(USER_SESSION_KEY);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Failed to logout' };
  }
};

export const getCurrentUser = async () => {
  const userId = await SecureStore.getItemAsync(USER_SESSION_KEY);
  if (!userId) return null;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, address, latitude, longitude')
    .eq('id', userId)
    .maybeSingle();

  if (error || !user) return null;

  return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { success: false, error: 'User not found' };
    }

    const isCorrect = await bcrypt.compare(currentPassword, data.password_hash);
    if (!isCorrect) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const newHash = await bcrypt.hash(String(newPassword), SALT_ROUNDS);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Failed to update password: ' + updateError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Change password error:', error);
    return { success: false, error: error.message || 'Password change failed' };
  }
};
