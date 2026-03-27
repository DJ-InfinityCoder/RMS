import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.log('Storage getItem error:', e);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.log('Storage setItem error:', e);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.log('Storage removeItem error:', e);
    }
  },
};