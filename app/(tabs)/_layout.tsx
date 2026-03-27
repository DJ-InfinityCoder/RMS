import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { useCart } from '@/lib/CartContext';

const ORANGE = '#FF7A00';
const INACTIVE = '#A0A5BA';

export default function TabLayout() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {/* 1 — Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />

      {/* 2 — Street Vendors */}
      <Tabs.Screen
        name="vendors"
        options={{
          title: 'Vendors',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <MaterialCommunityIcons
                name={focused ? 'store' : 'store-outline'}
                size={22}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      {/* 3 — Cart */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} badge={cartCount}>
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />

      {/* 4 — Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <MaterialCommunityIcons
                name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
                size={22}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      {/* 5 — Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Tab Icon with active indicator dot ──────────────────────────────────────

const TabIcon = ({
  children,
  focused,
  color,
  badge,
}: {
  children: React.ReactNode;
  focused: boolean;
  color: string;
  badge?: number;
}) => (
  <View style={tabIconStyles.wrapper}>
    <View style={[tabIconStyles.iconContainer, focused && tabIconStyles.iconContainerActive]}>
      {children}
      {badge != null && badge > 0 && (
        <View style={tabIconStyles.badge}>
          <Text style={tabIconStyles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
  </View>
);

const tabIconStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  iconContainer: {
    width: 42,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconContainerActive: {
    backgroundColor: '#FFF4E5',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ORANGE,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F5FA',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 0,
  },
  tabItem: {
    paddingVertical: 0,
  },
});
