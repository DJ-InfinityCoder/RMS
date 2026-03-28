import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  getStoredUserId,
  getUserProfile,
  updateUserProfile as updateUserProfileAPI,
  updateUserLocation as updateUserLocationAPI,
  getUserFoodPreferences,
  updateUserFoodPreferences,
  clearStoredSession,
} from '@/api/userApi';
import { UserProfile, UserFoodPreference } from '@/api/userApi';
import { cleanupOldPayments } from '@/api/paymentApi';

export interface UserProfileData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  latitude?: number;
  longitude?: number;
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
  locationEnabled: boolean;
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
  syncLocation: () => Promise<void>;
  setLocationEnabled: (enabled: boolean) => void;
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

// ─── Reverse Geocoding ───────────────────────────────────────────────────────

const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const addr = results[0];
      const parts = [
        addr.name,
        addr.street,
        addr.district,
        addr.city,
        addr.region,
        addr.postalCode,
      ].filter(Boolean);
      return parts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileData>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo>(INITIAL_LOYALTY);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // ── Load User Data from API ──────────────────────────────────────────────

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
          address: userProfile.address || '',
          latitude: userProfile.latitude,
          longitude: userProfile.longitude,
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

      // Cleanup old payments (> 15 days) on login
      cleanupOldPayments().catch(() => {});
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // ── Auto-sync location on login if enabled ────────────────────────────────

  const syncLocation = useCallback(async () => {
    if (!profile.id || !locationEnabled) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setLocationEnabled(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get readable address
      const address = await reverseGeocode(latitude, longitude);

      // Update profile in DB
      const updated = await updateUserLocationAPI(profile.id, latitude, longitude, address);

      if (updated) {
        setProfile((prev) => ({
          ...prev,
          address,
          latitude,
          longitude,
        }));
      }
    } catch (error) {
      console.error('Location sync error:', error);
    }
  }, [profile.id, locationEnabled]);

  // Sync location when user logs in and location is enabled
  useEffect(() => {
    if (isLoggedIn && locationEnabled && profile.id) {
      syncLocation();
    }
  }, [isLoggedIn, locationEnabled, profile.id, syncLocation]);

  const refreshProfile = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // ── Profile Update (globally synced via API) ──────────────────────────────

  const updateProfile = useCallback(async (updates: Partial<UserProfileData>) => {
    if (!profile.id) return;

    try {
      const apiUpdates: Partial<{ full_name: string; email: string; phone: string; address: string; latitude: number; longitude: number }> = {};
      if (updates.name) apiUpdates.full_name = updates.name;
      if (updates.email) apiUpdates.email = updates.email;
      if (updates.phone) apiUpdates.phone = updates.phone;
      if (updates.address) apiUpdates.address = updates.address;
      if (updates.latitude !== undefined) apiUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) apiUpdates.longitude = updates.longitude;

      const updated = await updateUserProfileAPI(profile.id, apiUpdates);
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          name: updated.full_name || prev.name,
          email: updated.email || prev.email,
          phone: updated.phone || prev.phone,
          address: updated.address || prev.address,
          latitude: updated.latitude ?? prev.latitude,
          longitude: updated.longitude ?? prev.longitude,
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
        locationEnabled,
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
        syncLocation,
        setLocationEnabled,
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
