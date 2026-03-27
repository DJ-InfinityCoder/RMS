import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { CartProvider } from '@/lib/CartContext';
import { UserProvider } from '@/lib/UserContext';
import { OrderProvider } from '@/lib/OrderContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { requestNotificationPermissions } from '@/utils/notifications';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // ─── Initialize Notifications ───
    requestNotificationPermissions();
  }, []);

  return (
    <PaperProvider>
      <UserProvider>
        <OrderProvider>
          <CartProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="signup" options={{ headerShown: false }} />
                <Stack.Screen name="verification" options={{ headerShown: false }} />
                <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="search" options={{ headerShown: false }} />
                <Stack.Screen name="scanner" options={{ headerShown: false }} />
                <Stack.Screen name="snap-menu" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                <Stack.Screen name="menu-result" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                <Stack.Screen name="map-directions" options={{ headerShown: false }} />
                <Stack.Screen name="terms" options={{ headerShown: false }} />
                <Stack.Screen name="privacy" options={{ headerShown: false }} />
                <Stack.Screen name="help" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </CartProvider>
        </OrderProvider>
      </UserProvider>
    </PaperProvider>
  );
}
