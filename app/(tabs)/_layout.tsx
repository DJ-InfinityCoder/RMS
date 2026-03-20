import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';

const ORANGE = '#FF7A00';
const INACTIVE = '#A0A5BA';

export default function TabLayout() {
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
      {/* 1 — Home (Restaurants) */}
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
                name={focused ? 'cart' : 'cart-outline'}
                size={22}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      {/* 3 — Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color}>
              <MaterialCommunityIcons
                name={focused ? 'receipt' : 'receipt-outline'}
                size={22}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      {/* 4 — Profile */}
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

      {/* Hide the legacy explore tab */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}

// ─── Tab Icon with active indicator dot ──────────────────────────────────────

const TabIcon = ({
  children,
  focused,
  color,
}: {
  children: React.ReactNode;
  focused: boolean;
  color: string;
}) => (
  <View style={tabIconStyles.wrapper}>
    <View style={[tabIconStyles.iconContainer, focused && tabIconStyles.iconContainerActive]}>
      {children}
    </View>
    {focused && <View style={tabIconStyles.dot} />}
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
