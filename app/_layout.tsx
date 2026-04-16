import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { CartProvider } from '@/lib/CartContext';
import { UserProvider, useUser } from '@/lib/UserContext';
import { OrderProvider } from '@/lib/OrderContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useRef, useState } from 'react';
import { requestNotificationPermissions } from '@/utils/notifications';
import { GlobalToast, ToastRef } from '@/components/Toast';
import AnimatedSplash from '@/components/AnimatedSplash';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

/**
 * AuthGate - Handles routing based on authentication state.
 * 
 * If user is logged in → redirect to home (tabs).
 * If not logged in → stay on welcome/login/signup screens.
 * Shows animated splash screen on first load.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const [showSplash, setShowSplash] = useState(true);
  const hasRedirected = useRef(false);

  // Handle auth-based navigation after splash finishes and user data loads
  useEffect(() => {
    if (showSplash || loading) return;
    if (hasRedirected.current) return;

    const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'login' || segments[0] === 'signup';

    if (isLoggedIn && inAuthGroup) {
      // User is logged in but on an auth screen → go to home
      hasRedirected.current = true;
      router.replace('/(tabs)' as any);
    } else if (!isLoggedIn && !inAuthGroup) {
      // User is not logged in and trying to access main app → go to welcome (guest mode removed)
      hasRedirected.current = true;
      router.replace('/welcome' as any);
    }
  }, [isLoggedIn, loading, showSplash, segments]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <>
      {children}
      {showSplash && <AnimatedSplash onFinish={handleSplashFinish} />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const toastRef = useRef<ToastRef>(null);

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
              <AuthGate>
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
              </AuthGate>
              <GlobalToast ref={toastRef} />
              <StatusBar style="auto" />
            </ThemeProvider>
          </CartProvider>
        </OrderProvider>
      </UserProvider>
    </PaperProvider>
  );
}
