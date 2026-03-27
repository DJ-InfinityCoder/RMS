import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  memberSince: string;
}

export interface UserPreferences {
  dietary: string; // 'Veg' | 'Non-Veg' | 'Vegan' | 'Any'
  allergies: string[]; // e.g. ['Dairy', 'Nuts', 'Gluten']
  favouriteCuisines: string[];
  spiceLevel: string; // 'Mild' | 'Medium' | 'Spicy'
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'cash';
  label: string;
  isDefault: boolean;
}

export interface LoyaltyInfo {
  points: number;
  threshold: number; // below this = online only
}

interface UserContextType {
  profile: UserProfile;
  preferences: UserPreferences;
  paymentMethods: PaymentMethod[];
  loyalty: LoyaltyInfo;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  addLoyaltyPoints: (pts: number) => void;
  deductLoyaltyPoints: (pts: number) => void;
  canPayCash: () => boolean;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  name: 'Bharat Sharma',
  email: 'bharat.sharma@email.com',
  phone: '+91 98765 43210',
  avatar: 'https://i.pravatar.cc/150?img=12',
  address: '12B, Sector 15, Noida, UP 201301',
  memberSince: 'January 2025',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  dietary: 'Any',
  allergies: [],
  favouriteCuisines: ['Indian', 'Chinese'],
  spiceLevel: 'Medium',
};

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', type: 'upi', label: 'UPI - PhonePe', isDefault: true },
  { id: 'pm2', type: 'card', label: 'HDFC Visa ****1234', isDefault: false },
];

const INITIAL_LOYALTY: LoyaltyInfo = {
  points: 1240,
  threshold: 500, // Same for all users initially
};

// ─── Context ─────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo>(INITIAL_LOYALTY);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

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

  return (
    <UserContext.Provider
      value={{
        profile,
        preferences,
        paymentMethods,
        loyalty,
        updateProfile,
        updatePreferences,
        addPaymentMethod,
        removePaymentMethod,
        addLoyaltyPoints,
        deductLoyaltyPoints,
        canPayCash,
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
