import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { restaurants, searchByItemOrCategory, Restaurant, getRestaurantsFromApi } from '@/data/restaurants';

// ─── Category Quick Filters ──────────────────────────────────────────────────

const SEARCH_CATEGORIES = [
  'Pizza', 'Burger', 'Biryani', 'Pasta', 'Dessert',
  'Indian', 'Chinese', 'Italian', 'Drinks', 'Starters',
];

const RECENT_KEYWORDS = ['Paneer', 'Pizza', 'Burger', 'Biryani'];

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantsData, setRestaurantsData] = useState<Restaurant[]>(restaurants);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getRestaurantsFromApi();
      setRestaurantsData(data);
    } catch (error) {
      console.error('Error in SearchScreen fetchData:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ─── Search with category matching ─────────────────────────────────────────
  const results = useMemo(() => {
    if (!searchText.trim()) return [];
    return searchByItemOrCategory(searchText, restaurantsData);
  }, [searchText, restaurantsData]);

  // ─── Matching menu items for detailed results ──────────────────────────────
  const matchingItems = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    const items: { restaurant: Restaurant; itemName: string; category: string; price: number; image: string }[] = [];
    restaurantsData.forEach((r) => {
      r.menuItems.forEach((m) => {
        if (
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.ingredients?.some((i) => i.toLowerCase().includes(q))
        ) {
          items.push({
            restaurant: r,
            itemName: m.name,
            category: m.category,
            price: m.price,
            image: m.image,
          });
        }
      });
    });
    return items;
  }, [searchText, restaurantsData]);

  const handleCategoryTap = (cat: string) => {
    setSearchText(cat);
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/restaurant/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.resultCuisine}>{item.cuisine.join(' • ')}</Text>
        <View style={styles.resultMeta}>
          <Ionicons name="star" size={12} color="#FF7A00" />
          <Text style={styles.resultRating}>{item.rating}</Text>
          <Text style={styles.resultDot}>•</Text>
          <Text style={styles.resultTime}>{item.deliveryTime}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#A0A5BA" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#A0A5BA" />
        <TextInput
          placeholder="Search by dish, category, or restaurant..."
          placeholderTextColor="#A0A5BA"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#D3D1D8" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7A00']} />
        }
      >
        {loading && !refreshing && (
          <ActivityIndicator size="large" color="#FF7A00" style={{ marginTop: 20 }} />
        )}
        {!searchText.trim() ? (
          <>
            {/* Recent Keywords */}
            <Text style={styles.subTitle}>Recent Searches</Text>
            <View style={styles.keywordRow}>
              {RECENT_KEYWORDS.map((kw) => (
                <TouchableOpacity
                  key={kw}
                  style={styles.chip}
                  onPress={() => handleCategoryTap(kw)}
                >
                  <Ionicons name="time-outline" size={14} color="#A0A5BA" />
                  <Text style={styles.chipText}>{kw}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Quick Filters */}
            <Text style={styles.subTitle}>Search by Category</Text>
            <View style={styles.categoryGrid}>
              {SEARCH_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.categoryChip}
                  onPress={() => handleCategoryTap(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryChipText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Suggested Restaurants */}
            <Text style={styles.subTitle}>Popular Restaurants</Text>
            <FlatList
              data={restaurantsData}
              keyExtractor={(item) => item.id}
              renderItem={renderRestaurant}
              scrollEnabled={false}
            />
          </>
        ) : (
          <>
            {/* Matching Restaurants */}
            {results.length > 0 && (
              <>
                <Text style={styles.subTitle}>
                  Restaurants ({results.length})
                </Text>
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  renderItem={renderRestaurant}
                  scrollEnabled={false}
                />
              </>
            )}

            {/* Matching Menu Items */}
            {matchingItems.length > 0 && (
              <>
                <Text style={styles.subTitle}>
                  Menu Items ({matchingItems.length})
                </Text>
                {matchingItems.map((mi, idx) => (
                  <TouchableOpacity
                    key={`${mi.restaurant.id}-${mi.itemName}-${idx}`}
                    style={styles.menuItemCard}
                    onPress={() => router.push(`/restaurant/${mi.restaurant.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: mi.image }} style={styles.menuItemImage} />
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{mi.itemName}</Text>
                      <Text style={styles.menuItemRestaurant}>{mi.restaurant.name}</Text>
                      <View style={styles.menuItemMeta}>
                        <Text style={styles.menuItemCategory}>{mi.category}</Text>
                        <Text style={styles.menuItemPrice}>₹{mi.price}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* No Results */}
            {results.length === 0 && matchingItems.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="magnify-close" size={48} color="#D0D5DD" />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different search term or category
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FA',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#181C2E' },

  subTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181C2E',
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 20,
  },

  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#FFF4E5',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF7A00',
  },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F0F5FA',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: { fontSize: 15, fontWeight: '700', color: '#181C2E' },
  resultCuisine: { fontSize: 11, color: '#A0A5BA', marginTop: 2, fontWeight: '500' },
  resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  resultRating: { fontSize: 12, fontWeight: '600', color: '#181C2E' },
  resultDot: { color: '#A0A5BA', fontSize: 12 },
  resultTime: { fontSize: 12, color: '#A0A5BA' },

  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F0F5FA',
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemName: { fontSize: 14, fontWeight: '700', color: '#181C2E' },
  menuItemRestaurant: { fontSize: 11, color: '#A0A5BA', marginTop: 2 },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  menuItemCategory: {
    fontSize: 11,
    color: '#FF7A00',
    fontWeight: '600',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItemPrice: { fontSize: 14, fontWeight: '700', color: '#181C2E' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#181C2E', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#A0A5BA', marginTop: 4 },
});
