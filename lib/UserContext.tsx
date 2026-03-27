import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getStoredUserId,
  getUserProfile,
  updateUserProfile as updateUserProfileAPI,
  getUserFoodPreferences,
  updateUserFoodPreferences,
  clearStoredSession,
} from '@/api/userApi';
import { UserProfile, UserFoodPreference } from '@/api/userApi';

export interface UserProfileData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  memberSince: string;
}

export interface UserPreferences {
  dietary: string;
  allergies: string[];
  favouriteCuisines: string[];
  spiceLevel: string;
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'cash';
  label: string;
  isDefault: boolean;
}

export interface LoyaltyInfo {
  points: number;
  threshold: number;
}

interface UserContextType {
  profile: UserProfileData;
  preferences: UserPreferences;
  paymentMethods: PaymentMethod[];
  loyalty: LoyaltyInfo;
  loading: boolean;
  isLoggedIn: boolean;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  addAllergy: (ingredient: string) => Promise<void>;
  removeAllergy: (ingredient: string) => Promise<void>;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  addLoyaltyPoints: (pts: number) => void;
  deductLoyaltyPoints: (pts: number) => void;
  canPayCash: () => boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_PROFILE: UserProfileData = {
  name: 'Guest',
  email: '',
  phone: '',
  avatar: 'https://i.pravatar.cc/150?img=12',
  address: '',
  memberSince: '',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  dietary: 'Any',
  allergies: [],
  favouriteCuisines: ['Indian', 'Chinese'],
  spiceLevel: 'Medium',
};

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', type: 'upi', label: 'UPI - PhonePe', isDefault: true },
];

const INITIAL_LOYALTY: LoyaltyInfo = {
  points: 0,
  threshold: 500,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileData>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo>(INITIAL_LOYALTY);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getStoredUserId();
      if (!userId) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setProfile({
          id: userProfile.id,
          name: userProfile.full_name || 'Guest',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          address: '',
          avatar: 'https://i.pravatar.cc/150?img=12',
          memberSince: '',
        });
      }

      const foodPrefs = await getUserFoodPreferences(userId);
      const allergies = foodPrefs
        .filter((p) => p.is_allergy)
        .map((p) => p.ingredient_name);

      setPreferences((prev) => ({
        ...prev,
        allergies,
      }));

      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const refreshProfile = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  const updateProfile = useCallback(async (updates: Partial<UserProfileData>) => {
    if (!profile.id) return;

    try {
      const apiUpdates: Partial<{ full_name: string; email: string; phone: string }> = {};
      if (updates.name) apiUpdates.full_name = updates.name;
      if (updates.email) apiUpdates.email = updates.email;
      if (updates.phone) apiUpdates.phone = updates.phone;

      const updated = await updateUserProfileAPI(profile.id, apiUpdates);
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          name: updated.full_name || prev.name,
          email: updated.email || prev.email,
          phone: updated.phone || prev.phone,
        }));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [profile.id]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!profile.id) return;

    try {
      setPreferences((prev) => ({ ...prev, ...updates }));

      if (updates.allergies !== undefined) {
        await updateUserFoodPreferences(profile.id, updates.allergies);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }, [profile.id]);

  const addAllergy = useCallback(async (ingredient: string) => {
    if (!profile.id) return;

    try {
      const newAllergies = [...preferences.allergies, ingredient];
      setPreferences((prev) => ({ ...prev, allergies: newAllergies }));
      await updateUserFoodPreferences(profile.id, newAllergies);
    } catch (error) {
      console.error('Failed to add allergy:', error);
      throw error;
    }
  }, [profile.id, preferences.allergies]);

  const removeAllergy = useCallback(async (ingredient: string) => {
    if (!profile.id) return;

    try {
      const newAllergies = preferences.allergies.filter((a) => a !== ingredient);
      setPreferences((prev) => ({ ...prev, allergies: newAllergies }));
      await updateUserFoodPreferences(profile.id, newAllergies);
    } catch (error) {
      console.error('Failed to remove allergy:', error);
      throw error;
    }
  }, [profile.id, preferences.allergies]);

  const addPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, method]);
  }, []);

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addLoyaltyPoints = useCallback((pts: number) => {
    setLoyalty((prev) => ({ ...prev, points: prev.points + pts }));
  }, []);

  const deductLoyaltyPoints = useCallback((pts: number) => {
    setLoyalty((prev) => ({
      ...prev,
      points: Math.max(0, prev.points - pts),
    }));
  }, []);

  const canPayCash = useCallback(() => {
    return loyalty.points >= loyalty.threshold;
  }, [loyalty]);

  const logout = useCallback(async () => {
    await clearStoredSession();
    setProfile(DEFAULT_PROFILE);
    setPreferences(DEFAULT_PREFERENCES);
    setLoyalty(INITIAL_LOYALTY);
    setIsLoggedIn(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        profile,
        preferences,
        paymentMethods,
        loyalty,
        loading,
        isLoggedIn,
        updateProfile,
        updatePreferences,
        addAllergy,
        removeAllergy,
        addPaymentMethod,
        removePaymentMethod,
        addLoyaltyPoints,
        deductLoyaltyPoints,
        canPayCash,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
