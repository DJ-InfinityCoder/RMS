import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import {
  getStoredUserId,
  getUserProfile,
  updateUserProfile as updateUserProfileAPI,
  updateUserLocation as updateUserLocationAPI,
  getUserFoodPreferences,
  updateUserFoodPreferences,
  clearStoredSession,
  getUserLoyaltyPoints,
  addUserLoyaltyPoints,
  deductUserLoyaltyPoints,
} from '@/api/userApi';
import { UserProfile, UserFoodPreference } from '@/api/userApi';
import { cleanupOldPayments } from '@/api/paymentApi';
import { LOYALTY_THRESHOLD, INITIAL_LOYALTY_POINTS } from '@/services/loyaltyService';
import { setCachedPreferences, clearPreferenceCache } from '@/services/preferencesService';

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
  points: INITIAL_LOYALTY_POINTS,
  threshold: LOYALTY_THRESHOLD,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// ─── Reverse Geocoding (with retry for APK reliability) ──────────────────────

/**
 * Reverse geocodes coordinates to a human-readable address.
 * Uses expo-location's built-in reverse geocoding which works
 * on Android without a Google Maps API key (uses Android's Geocoder).
 * 
 * Includes retry logic for APK builds where the Geocoder service
 * may not be immediately available on first call.
 */
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second between retries

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // console.log(`[Location] Reverse geocoding attempt ${attempt}/${MAX_RETRIES} for (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      
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
        
        const address = parts.join(', ');
        if (address && address.trim().length > 0) {
          return address;
        }
      }
      
    } catch (error: any) {
      console.error(`[Location] Reverse geocoding error (attempt ${attempt}):`, error?.message || error);
    }

    // Wait before retrying (except on last attempt)
    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
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

      // Load dietary and favourites from profile, and allergies from foodPrefs
      const foodPrefs = await getUserFoodPreferences(userId);
      const allergies = foodPrefs
        .filter((p) => p.is_allergy)
        .map((p) => p.ingredient_name);

      setPreferences((prev) => ({
        ...prev,
        allergies,
        dietary: userProfile.dietary || prev.dietary,
        favouriteCuisines: userProfile.favourite_cuisines || prev.favouriteCuisines,
      }));

      // Load loyalty points from database
      const loyaltyPts = await getUserLoyaltyPoints(userId);
      setLoyalty(prev => ({ ...prev, points: loyaltyPts }));

      // Cache preferences for faster filtering
      setCachedPreferences({
        allergies,
        favouriteCuisines: userProfile.favourite_cuisines || preferences.favouriteCuisines,
        dietary: userProfile.dietary || preferences.dietary,
      });

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

  // ── Location Sync (APK-compatible with robust error handling) ─────────────

  /**
   * syncLocation - Gets device location and updates user profile.
   * 
   * This implementation handles common APK issues:
   * 1. Requests foreground permission explicitly
   * 2. Checks if location services are enabled on device
   * 3. Falls back to lastKnownPosition if getCurrentPosition fails
   * 4. Retries reverse geocoding with delays
   * 5. Logs all steps for debugging
   */
  const syncLocation = useCallback(async () => {
    if (!profile.id || !locationEnabled) {
      // console.log('[Location] Skipping sync - no user ID or location disabled');
      return;
    }

    try {
      // Step 1: Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationEnabled(false);
        return;
      }
      // console.log('[Location] Permission granted');

      // Step 2: Check if location services are enabled on device
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        // console.log('[Location] Device location services are OFF');
        // Still try - some devices report false but work anyway
      }

      // Step 3: Get current position with appropriate accuracy
      let latitude: number;
      let longitude: number;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Platform.OS === 'android' 
            ? Location.Accuracy.High  // Use High on Android for APK reliability
            : Location.Accuracy.Balanced,
          // Android APK fix: set a timeout to avoid hanging
          ...(Platform.OS === 'android' ? { timeInterval: 5000, distanceInterval: 0 } : {}),
        });
        
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      } catch (posError: any) {
        // Fallback: try getLastKnownPositionAsync
        
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          latitude = lastKnown.coords.latitude;
          longitude = lastKnown.coords.longitude;
        } else {
          return;
        }
      }

      // Step 4: Reverse geocode to get readable address (with retries)
      const address = await reverseGeocode(latitude, longitude);

      // Step 5: Update profile in DB
      const updated = await updateUserLocationAPI(profile.id, latitude, longitude, address);

      if (updated) {
        setProfile((prev) => ({
          ...prev,
          address,
          latitude,
          longitude,
        }));
      } else {
        // console.error('[Location] Database update returned null');
      }
    } catch (error: any) {
      // console.error('[Location] Sync error:', error?.message || error);
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

      // Save allergies to user_food_preferences table
      if (updates.allergies !== undefined) {
        await updateUserFoodPreferences(profile.id, updates.allergies);
      }

      // Save dietary and favouriteCuisines to users table
      const profileUpdates: any = {};
      if (updates.dietary !== undefined) profileUpdates.dietary = updates.dietary;
      if (updates.favouriteCuisines !== undefined) profileUpdates.favourite_cuisines = updates.favouriteCuisines;

      if (Object.keys(profileUpdates).length > 0) {
        await updateUserProfileAPI(profile.id, profileUpdates);
      }
      
      // Update Cache
      setCachedPreferences({
        allergies: updates.allergies ?? preferences.allergies,
        favouriteCuisines: updates.favouriteCuisines ?? preferences.favouriteCuisines,
        dietary: updates.dietary ?? preferences.dietary,
      });

    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }, [profile.id, preferences]);

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

  const addLoyaltyPoints = useCallback(async (pts: number) => {
    setLoyalty((prev) => ({ ...prev, points: prev.points + pts }));
    if (profile.id) {
      try {
        await addUserLoyaltyPoints(profile.id, pts);
      } catch (e) {
        console.error('Failed to sync loyalty points add:', e);
      }
    }
  }, [profile.id]);

  const deductLoyaltyPoints = useCallback(async (pts: number) => {
    setLoyalty((prev) => ({
      ...prev,
      points: Math.max(0, prev.points - pts),
    }));
    if (profile.id) {
      try {
        await deductUserLoyaltyPoints(profile.id, pts);
      } catch (e) {
        console.error('Failed to sync loyalty points deduction:', e);
      }
    }
  }, [profile.id]);

  const canPayCash = useCallback(() => {
    return loyalty.points >= loyalty.threshold;
  }, [loyalty]);

  const logout = useCallback(async () => {
    await clearStoredSession();
    clearPreferenceCache();
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
