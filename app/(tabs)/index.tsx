import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Removed: import useUserLocation from '@/hooks/useUserLocation';
import { getRestaurants, DBRestaurant, getTrendingDishes, getOffers, DBMenuItem } from '@/api/restaurantApi';
import { useUser } from '@/lib/UserContext';
import { useCart } from '@/lib/CartContext';
import Skeleton from '@/components/ui/Skeleton';

const { width } = Dimensions.get('window');

const QUICK_CATEGORIES = [
  { id: "1", name: "All", icon: "fire" },
  { id: "7", name: "Vendors", icon: "store" },
  { id: "2", name: "Pizza", icon: "pizza" },
  { id: "3", name: "Burger", icon: "hamburger" },
  { id: "4", name: "Indian", icon: "food-variant" },
  { id: "5", name: "Pasta", icon: "pasta" },
  { id: "6", name: "Dessert", icon: "cupcake" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile, syncLocation, loading: userLoading } = useUser();
  const { items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [restaurants, setRestaurants] = useState<DBRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendingDishes, setTrendingDishes] = useState<DBMenuItem[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const cartItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);

  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setErrorStatus(null);
      const [resData, dishesData, offersData] = await Promise.all([
        getRestaurants(),
        getTrendingDishes(),
        getOffers(),
      ]);
      
      setRestaurants(resData);
      setTrendingDishes(dishesData);
      setOffers(offersData);
      
      if (resData.length === 0) {
        setErrorStatus('No restaurants found in database.');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setErrorStatus(error.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
    syncLocation();
  };

  // ─── Time-based Greeting ───────────────────────────────────────────────────
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  }, []);

  // ─── Category filter ───────────────────────────────────────────────────────
  const filteredRestaurants = useMemo(() => {
    // We use restaurants even if coordinates aren't synced yet
    const nearby = restaurants;

    if (selectedCategory === "All") return nearby;

    return nearby.filter((res) =>
      res.cuisine.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  }, [selectedCategory, restaurants]);

  const renderCategory = ({ item }: { item: (typeof QUICK_CATEGORIES)[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard as any,
        selectedCategory === item.name && styles.categoryCardActive,
      ]}
      onPress={() => {
        if (item.name === "Vendors") {
          router.push("/vendors" as any);
        } else {
          setSelectedCategory(item.name);
        }
      }}
      activeOpacity={0.8}
    >
      <View style={[
          styles.catIconWrap as any,
          selectedCategory === item.name && styles.catIconWrapActive
      ]}>
        <MaterialCommunityIcons
          name={item.icon as any}
          size={18}
          color={selectedCategory === item.name ? "#FFF" : "#FF7A00"}
        />
      </View>
      <Text
        style={[
          styles.categoryText as any,
          selectedCategory === item.name && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const { items: cartItems } = useCart();
  
  const getCartCountForRestaurant = (resId: string) => {
    return cartItems
      .filter(i => i.restaurantId === resId)
      .reduce((sum, item) => sum + item.qty, 0);
  };

  const getCartCountForDish = (dishId: string) => {
      const item = cartItems.find(i => i.id === dishId);
      return item ? item.qty : 0;
  };

  const renderDish = ({ item }: { item: DBMenuItem }) => {
    const count = getCartCountForDish(item.id);
    return (
        <TouchableOpacity 
            style={styles.dishCard as any}
            onPress={() => router.push(`/restaurant/${item.restaurant_id}` as any)}
        >
            <Image source={{ uri: item.image_url || '' }} style={styles.dishImage as any} />
            {count > 0 && (
                <View style={styles.dishBadge as any}>
                    <Text style={styles.dishBadgeText as any}>{count}</Text>
                </View>
            )}
            <View style={styles.dishInfo as any}>
                <Text style={styles.dishName as any} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.dishPrice as any}>₹{item.price}</Text>
            </View>
        </TouchableOpacity>
    );
  };

  const renderRestaurant = ({ item }: { item: DBRestaurant & { dishes?: any[] } }) => {
    const resCartCount = getCartCountForRestaurant(item.id);
    return (
    <TouchableOpacity
      style={styles.restaurantCard as any}
      onPress={() => router.push(`/restaurant/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image_url || '' }} style={styles.resImage as any} />
      {resCartCount > 0 && (
          <View style={styles.resCartBadge as any}>
              <Ionicons name="cart" size={12} color="#FFF" />
              <Text style={styles.resCartBadgeText as any}>{resCartCount}</Text>
          </View>
      )}
      <View style={styles.resInfo as any}>
        <Text style={styles.resName as any}>{item.name}</Text>
        <Text style={styles.resCuisine as any}>{item.cuisine.join(" • ")}</Text>
        <View style={styles.resMetaRow as any}>
          <View style={styles.resMetaItem as any}>
            <Ionicons name="star" size={14} color="#FF7A00" />
            <Text style={styles.resMetaText as any}>{item.rating}</Text>
          </View>
          <View style={styles.resMetaDot as any} />
          <View style={styles.resMetaItem as any}>
            <Ionicons name="time-outline" size={14} color="#A0A5BA" />
            <Text style={styles.resMetaText as any}>{item.deliveryTime}</Text>
          </View>
          <View style={styles.resMetaDot as any} />
          <View style={styles.resMetaItem as any}>
            <Ionicons name="restaurant-outline" size={14} color="#A0A5BA" />
            <Text style={styles.resMetaText as any}>{item.dishes?.length || 0} items</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

  if (userLoading || loading) {
    return (
      <SafeAreaView style={styles.container as any}>
        <View style={styles.headerRow as any}>
          <View>
             <Skeleton width={120} height={18} style={{ marginBottom: 8 }} />
             <Skeleton width={180} height={24} />
          </View>
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
          <Skeleton width="100%" height={160} borderRadius={24} style={{ marginTop: 20 }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 15 }}>
            <Skeleton width={100} height={20} />
            <Skeleton width={60} height={20} />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={80} height={40} borderRadius={20} style={{ marginRight: 10 }} />
            ))}
          </ScrollView>

          <View style={{ height: 20 }} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ marginBottom: 20 }}>
              <Skeleton width="100%" height={150} borderRadius={16} />
              <Skeleton width="60%" height={18} style={{ marginTop: 12 }} />
              <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container as any}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7A00']} />
        }
      >
        {/* ─── Clean Minimal Header ──────────────────────────────────────── */}
        <View style={styles.headerRow as any}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 , marginTop: 10 }}>
                <Ionicons name="location" size={14} color="#FF7A00" />
                <Text style={styles.greetingSmall as any} numberOfLines={1}>
                    {profile.address || 'Address not synced'}
                </Text>
            </View>
            <Text style={styles.greetingBold as any}>{greeting}, {profile.name.split(' ')[0]}! 👋</Text>
          </View>
          <View style={styles.headerActions as any}>
            <TouchableOpacity
              style={[styles.notifBtn as any, { marginLeft: 10, marginTop: 10 }]}
              onPress={() => router.push('/(tabs)/cart' as any)}
            >
              <Ionicons name="cart-outline" size={22} color="#181C2E" />
              {cartItemCount > 0 && (
                <View style={styles.badge as any}>
                  <Text style={styles.badgeText as any}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.notifBtn as any, { marginLeft: 10, marginTop: 10 }]}
              onPress={() => router.push('/settings' as any)}
            >
              <Ionicons name="settings-outline" size={22} color="#181C2E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Search Bar ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.searchBar as any}
          onPress={() => router.push("/search" as any)}
          activeOpacity={0.8}
        >
          <View style={styles.searchInner as any}>
              <Ionicons name="search-outline" size={20} color="#FF7A00" />
              <Text style={styles.searchPlaceholder as any}>
                Search dishes, restaurants...
              </Text>
          </View>
          <View style={styles.filterBtn as any}>
              <Ionicons name="options-outline" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* ─── Special Offers Banner ─────────────────────────────────────── */}
        {offers.length > 0 && (
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.offersContainer as any}
                snapToInterval={width - 40}
                decelerationRate="fast"
            >
                {offers.map((offer, idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        style={[styles.offerCard as any, { backgroundColor: idx % 2 === 0 ? '#321D0B' : '#FF7A00' }]}
                        onPress={() => router.push(`/restaurant/${offer.restaurant?.id}` as any)}
                    >
                        <View style={styles.offerContent as any}>
                            <Text style={styles.offerTag as any}>SPECIAL OFFER</Text>
                            <Text style={styles.offerTitle as any}>{offer.title || `${offer.discount_percent}% Flat Discount`}</Text>
                            <Text style={styles.offerDesc as any}>{offer.description || 'On all orders above ₹499'}</Text>
                            
                            <View style={styles.offerResWrap as any}>
                                <Ionicons name="restaurant" size={12} color="rgba(255,255,255,0.7)" />
                                <Text style={styles.offerResText as any}>{offer.restaurant?.name} • {offer.restaurant?.address?.split(',')[0]}</Text>
                            </View>
                        </View>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' }} 
                            style={styles.offerImage as any} 
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        )}

        {/* ─── Scan Buttons ──────────────────────────────────────────────── */}
        <View style={styles.scanRow as any}>
          <TouchableOpacity
            style={styles.scanButton as any}
            onPress={() => router.push("/scanner?mode=qr" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.scanIconWrap as any}>
              <Ionicons name="qr-code-outline" size={20} color="#FFF" />
            </View>
            <View>
              <Text style={styles.scanTitle as any}>Scan QR</Text>
              <Text style={styles.scanSub as any}>Quick Menu</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scanButton as any, styles.scanButtonAlt as any]}
            onPress={() => router.push("/snap-menu" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.scanIconWrapAlt as any}>
              <MaterialCommunityIcons
                name="text-recognition"
                size={20}
                color="#FFF"
              />
            </View>
            <View>
              <Text style={styles.scanTitle as any}>Snap Menu</Text>
              <Text style={styles.scanSub as any}>AI OCR Scan</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Trending Dishes ───────────────────────────────────────────── */}
        {trendingDishes.length > 0 && selectedCategory === "All" && (
            <View style={styles.trendingSection as any}>
                <View style={styles.sectionHeader as any}>
                    <Text style={styles.sectionTitle as any}>Popular Dishes</Text>
                </View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={trendingDishes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDish}
                    contentContainerStyle={styles.trendingList as any}
                />
            </View>
        )}

        {/* ─── Categories ────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader as any}>
          <Text style={styles.sectionTitle as any}>Categories</Text>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoryList as any}
        />

        {/* ─── Restaurants ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader as any}>
          <Text style={styles.sectionTitle as any}>
            {selectedCategory === "All"
              ? "Open Restaurants"
              : `"${selectedCategory}" Restaurants`}
          </Text>
          <Text style={styles.countBadge as any}>{filteredRestaurants.length}</Text>
        </View>

        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          scrollEnabled={false}
          contentContainerStyle={{ marginTop: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyState as any}>
              <MaterialCommunityIcons
                name={errorStatus ? "alert-circle-outline" : "store-off-outline"}
                size={48}
                color={errorStatus ? "#EF4444" : "#D0D5DD"}
              />
              <Text style={styles.emptyTitle as any}>
                {errorStatus ? "Data Fetching Error" : "No restaurants found"}
              </Text>
              <Text style={styles.emptySubtitle as any}>
                {errorStatus || (selectedCategory !== "All"
                  ? `No restaurants serve "${selectedCategory}" near you`
                  : "No restaurants nearby")}
              </Text>
              {errorStatus && (
                <TouchableOpacity style={styles.retryBtn as any} onPress={fetchData}>
                  <Text style={styles.retryBtnText as any}>Retry Fetch</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        {/* ─── Footer ────────────────────────────────────────────────────── */}
        <View style={styles.footer as any}>
            <View style={styles.footerTop as any}>
                <View>
                    <Text style={styles.footerBrand as any}>RMS</Text>
                    <Text style={styles.footerTagline as any}>Manage your orders and Table Booking</Text>
                </View>
            </View>
            
            <View style={styles.footerDivider as any} />
            
            <View style={styles.footerBottom as any}>
                <Text style={styles.footerCopyright as any}>© 2026 RMS. All rights reserved.</Text>
                <View style={styles.footerSocials as any}>
                    <TouchableOpacity style={styles.socialIcon as any}>
                        <Ionicons name="logo-instagram" size={18} color="#A0A5BA" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon as any}>
                        <Ionicons name="logo-twitter" size={18} color="#A0A5BA" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon as any}>
                        <Ionicons name="logo-facebook" size={18} color="#A0A5BA" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.versionText as any}>Version 2.10.0 (Stable)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFCFF",
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFCFF",
  },
  loadingText: {
    marginTop: 14,
    color: "#A0A5BA",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Header ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  greetingSmall: {
    fontSize: 14,
    color: "#A0A5BA",
    fontWeight: "500",
  },
  greetingBold: {
    fontSize: 22,
    fontWeight: "700",
    color: "#181C2E",
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F5FA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FBFCFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // ── Search ──
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 6,
    paddingLeft: 16,
    marginTop: 18,
    alignItems: "center",
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F5FA',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchPlaceholder: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  filterBtn: {
    backgroundColor: '#FF7A00',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Offers ──
  offersContainer: {
    paddingVertical: 20,
    gap: 15,
  },
  offerCard: {
    width: width - 70,
    height: 150,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    marginRight: 10,
  },
  offerContent: {
    flex: 1,
    zIndex: 2,
  },
  offerTag: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  offerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  offerDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  offerBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  offerBtnText: {
    color: '#181C2E',
    fontWeight: '700',
    fontSize: 12,
  },
  offerImage: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 140,
    height: 140,
    opacity: 0.6,
    borderRadius: 70,
  },
  offerResWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 6,
  },
  offerResText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 11,
      fontWeight: '600',
  },

  // ── Scan Buttons ──
  scanRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 12,
    marginBottom: 10,
  },
  scanButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    gap: 12,
    elevation: 3,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F5FA",
  },
  scanButtonAlt: {
    shadowColor: "#181C2E",
  },
  scanIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
  },
  scanIconWrapAlt: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#181C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  scanTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#181C2E",
  },
  scanSub: {
    fontSize: 10,
    color: "#A0A5BA",
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Trending ──
  trendingSection: {
    marginTop: 10,
  },
  trendingList: {
    paddingVertical: 15,
  },
  dishCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  dishImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0F5FA',
  },
  dishBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  dishBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  dishInfo: {
    padding: 10,
  },
  dishName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#181C2E',
  },
  dishPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A00',
    marginTop: 2,
  },

  // ── Section ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#181C2E",
  },
  seeAll: {
    color: "#FF7A00",
    fontWeight: "700",
    fontSize: 13,
  },
  countBadge: {
    backgroundColor: "#FF7A00",
    color: "#FFF",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  // ── Categories ──
  categoryList: {
    paddingVertical: 12,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F5FA",
  },
  categoryCardActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
    elevation: 5,
    shadowColor: "#FF7A00",
    shadowOpacity: 0.3,
  },
  catIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FFF4E5',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: -4,
      marginLeft: -4,
  },
  catIconWrapActive: {
      backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryText: {
    marginLeft: 10,
    fontWeight: "700",
    fontSize: 13,
    color: "#181C2E",
  },
  categoryTextActive: {
    color: "#FFF",
  },

  // ── Restaurant Cards ──
  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    position: 'relative',
  },
  resCartBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: '#FF7A00',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 5,
      borderWidth: 1.5,
      borderColor: '#FFF',
  },
  resCartBadgeText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '800',
  },
  resImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#F0F5FA",
  },
  resInfo: {
    padding: 18,
  },
  resName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#181C2E",
    marginBottom: 4,
  },
  resCuisine: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 12,
  },
  resMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D5DD",
    marginHorizontal: 10,
  },
  resMetaText: {
    fontSize: 13,
    color: "#181C2E",
    fontWeight: "600",
  },

  // ── Map ──
  mapContainer: {
    height: 200,
    marginVertical: 15,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  // ── Empty ──
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#181C2E",
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  retryBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF7A00",
    borderRadius: 14,
  },

  // ── Footer ──
  footer: {
    backgroundColor: '#F8F9FB',
    padding: 30,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F0F5FA',
    alignItems: 'center',
  },
  footerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  footerLogo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#FFF',
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#181C2E',
  },
  footerTagline: {
    fontSize: 12,
    color: '#A0A5BA',
    marginTop: 2,
    fontWeight: '500',
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEF2F6',
    marginBottom: 20,
  },
  footerBottom: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 10,
    color: '#A0A5BA',
    fontWeight: '500',
    flex: 1,
  },
  footerSocials: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  versionText: {
    fontSize: 9,
    color: '#D0D5DD',
    marginTop: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
