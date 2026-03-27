import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useUser } from '@/lib/UserContext';
import { useCart } from '@/lib/CartContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  allergens: string[];
  ingredients: string[];
  calories: number;
}

interface RestaurantData {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  image_url: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
}

export default function RestaurantPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = typeof params.id === 'string' ? params.id : '';

  const { preferences } = useUser();
  const { addItem, items } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isBookingVisible, setBookingVisible] = useState(false);
  const [guests, setGuests] = useState('2');
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch restaurant
      const { data: restData, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restError) throw restError;

      if (restData) {
        setRestaurant({
          id: restData.id,
          name: restData.name || 'Restaurant',
          description: restData.description || 'Delicious food awaits you',
          address: restData.address || '',
          phone: restData.phone || '',
          latitude: restData.latitude || 0,
          longitude: restData.longitude || 0,
          image_url: restData.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
          cuisine: ['Indian', 'Continental'],
          rating: 4.5,
          deliveryTime: '25 min',
        });
      }

      // Fetch menu items
      const { data: dishData, error: dishError } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);

      if (dishError) throw dishError;

      if (dishData) {
        const items: MenuItem[] = dishData.map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || 'Tasty dish',
          price: Number(d.price) || 0,
          category: d.recommended_for || 'Main Course',
          image_url: d.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          allergens: d.allergens ? [d.allergens] : [],
          ingredients: [d.cooking_method || 'Fresh ingredients'],
          calories: d.calories || 300,
        }));
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      Alert.alert('Error', 'Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const cartItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    menuItems.forEach((m) => cats.add(m.category));
    return ['All', ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter((m) => m.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  const hasAllergen = (item: MenuItem): boolean => {
    return item.allergens.some((a) =>
      preferences.allergies.some((ua) => ua.toLowerCase() === a.toLowerCase())
    );
  };

  const getMatchingAllergens = (item: MenuItem): string[] => {
    return item.allergens.filter((a) =>
      preferences.allergies.some((ua) => ua.toLowerCase() === a.toLowerCase())
    );
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    
    if (hasAllergen(item)) {
      const allergens = getMatchingAllergens(item);
      Alert.alert(
        'Allergen Warning',
        `This item contains: ${allergens.join(', ')}.\nAre you sure you want to add it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Anyway',
            onPress: () => {
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              });
              Alert.alert('Added!', `${item.name} added to cart`);
            },
          },
        ]
      );
    } else {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      });
      Alert.alert('Added!', `${item.name} added to cart`);
    }
  };

  const handleOpenMap = () => {
    if (!restaurant) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  };

  const handleBookTable = () => {
    if (!selectedSlot) {
      Alert.alert('Select Slot', 'Please select a time slot');
      return;
    }
    Alert.alert('Success', `Table booked for ${guests} guests at ${selectedSlot}!`);
    setBookingVisible(false);
  };

  const tableSlots = [
    { time: '6:00 PM', totalSeats: 10, bookedSeats: 3 },
    { time: '6:30 PM', totalSeats: 10, bookedSeats: 5 },
    { time: '7:00 PM', totalSeats: 10, bookedSeats: 10 },
    { time: '7:30 PM', totalSeats: 10, bookedSeats: 2 },
    { time: '8:00 PM', totalSeats: 10, bookedSeats: 7 },
    { time: '8:30 PM', totalSeats: 10, bookedSeats: 4 },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text style={styles.loadingText}>Loading restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="restaurant-outline" size={48} color="#A0A5BA" />
          <Text style={styles.loadingText}>Restaurant not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.iconButton, { marginRight: 10 }]} onPress={() => router.push('/(tabs)/cart')}>
            <Ionicons name="cart-outline" size={22} color="#FF7A00" />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleOpenMap}>
            <Ionicons name="map-outline" size={22} color="#FF7A00" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: restaurant.image_url }} style={styles.heroImage} />

        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisineTags}>{restaurant.cuisine.join(' • ')}</Text>
          <Text style={styles.description}>{restaurant.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#FF7622" />
              <Text style={styles.statText}>{restaurant.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="navigate-outline" size={18} color="#FF7622" />
              <Text style={styles.statText}>2.5 km</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color="#FF7622" />
              <Text style={styles.statText}>{restaurant.deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setBookingVisible(true)}>
              <MaterialCommunityIcons name="table-chair" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Book Table</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <Text style={styles.menuCount}>{filteredItems.length} items</Text>
        </View>

        {preferences.allergies.length > 0 && (
          <View style={styles.allergenBanner}>
            <Ionicons name="warning" size={16} color="#EF4444" />
            <Text style={styles.allergenBannerText}>
              Items with your allergens ({preferences.allergies.join(', ')}) are flagged
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.popularSection}>
          {filteredItems.length > 0 ? (
            <View style={styles.grid}>
              {filteredItems.map((item) => {
                const isAllergen = hasAllergen(item);
                const matchedAllergens = getMatchingAllergens(item);

                return (
                  <View
                    key={item.id}
                    style={[styles.card, isAllergen && styles.cardAllergen]}
                  >
                    {isAllergen && (
                      <View style={styles.allergenFlag}>
                        <Text style={styles.allergenFlagText}>{matchedAllergens.join(', ')}</Text>
                      </View>
                    )}

                    <Image source={{ uri: item.image_url }} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                      <Text style={styles.cardMeta}>{item.calories} kcal</Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                        <TouchableOpacity
                          style={[styles.addButton, isAllergen && styles.addButtonAllergen]}
                          onPress={() => handleAddToCart(item)}
                        >
                          <Ionicons name="add" size={20} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noItemsText}>No items in this category yet.</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isBookingVisible}
        onRequestClose={() => setBookingVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book a Table</Text>

            <Text style={styles.label}>Number of Guests</Text>
            <TextInput
              style={styles.input}
              value={guests}
              onChangeText={setGuests}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Select Time Slot</Text>
            <View style={styles.slotGrid}>
              {tableSlots.map((slot) => {
                const available = slot.totalSeats - slot.bookedSeats;
                const isFull = available <= 0;
                return (
                  <TouchableOpacity
                    key={slot.time}
                    style={[
                      styles.slotCard,
                      selectedSlot === slot.time && styles.slotCardActive,
                      isFull && styles.slotCardDisabled,
                    ]}
                    onPress={() => !isFull && setSelectedSlot(slot.time)}
                    disabled={isFull}
                    activeOpacity={isFull ? 1 : 0.8}
                  >
                    <Text style={[
                      styles.slotTime,
                      selectedSlot === slot.time && styles.slotTimeActive,
                      isFull && styles.slotTimeDisabled,
                    ]}>
                      {slot.time}
                    </Text>
                    <Text style={[
                      styles.slotAvail,
                      isFull && styles.slotAvailDisabled,
                    ]}>
                      {isFull ? 'Full' : `${available} seats`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleBookTable}>
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookingVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#A0A5BA',
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F0F5FA',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#181C2E', flex: 1, marginLeft: 10 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F0F5FA',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: { paddingBottom: 40 },
  heroImage: {
    width: width - 40,
    height: 200,
    borderRadius: 22,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#F0F5FA',
  },
  infoSection: { paddingHorizontal: 24, marginBottom: 20 },
  restaurantName: { fontSize: 24, fontWeight: '700', color: '#181C2E', marginBottom: 4 },
  cuisineTags: { fontSize: 13, color: '#FF7A00', fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 22, color: '#A0A5BA', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 4 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  statText: { fontSize: 13, fontWeight: '600', color: '#181C2E', marginLeft: 6 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#FF7622',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { color: '#FFF', fontWeight: '700', marginLeft: 6, fontSize: 12 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E' },
  menuCount: { fontSize: 13, color: '#A0A5BA', fontWeight: '600' },

  allergenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 24,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  allergenBannerText: { fontSize: 12, color: '#EF4444', fontWeight: '600', flex: 1 },

  categoriesContainer: { paddingHorizontal: 24, marginBottom: 20 },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: '#FFF',
    marginRight: 10,
  },
  categoryButtonActive: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#181C2E' },
  categoryTextActive: { color: '#FFF' },

  popularSection: { paddingHorizontal: 24, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F5FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardAllergen: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FFF7F7',
  },
  allergenFlag: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  allergenFlagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  cardImage: {
    width: '100%',
    height: 90,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#F0F5FA',
  },
  cardContent: {},
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#181C2E', marginBottom: 2 },
  cardDesc: { fontSize: 11, color: '#A0A5BA', marginBottom: 4, lineHeight: 16 },
  cardMeta: { fontSize: 11, color: '#A0A5BA', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceText: { fontSize: 16, fontWeight: '700', color: '#181C2E' },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF7622',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonAllergen: { backgroundColor: '#EF4444' },

  noItemsText: { textAlign: 'center', color: '#999', marginTop: 20 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#181C2E' },
  label: { fontSize: 13, color: '#A0A5BA', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#F0F5FA', padding: 14, borderRadius: 12, marginBottom: 14, fontSize: 15 },

  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  slotCard: {
    backgroundColor: '#F0F5FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1.5,
    borderColor: '#F0F5FA',
  },
  slotCardActive: { borderColor: '#FF7A00', backgroundColor: '#FFF4E5' },
  slotCardDisabled: { opacity: 0.4 },
  slotTime: { fontSize: 14, fontWeight: '700', color: '#181C2E' },
  slotTimeActive: { color: '#FF7A00' },
  slotTimeDisabled: { color: '#A0A5BA' },
  slotAvail: { fontSize: 11, color: '#22C55E', fontWeight: '600', marginTop: 2 },
  slotAvailDisabled: { color: '#EF4444' },

  confirmBtn: { backgroundColor: '#FF7622', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#A0A5BA', fontWeight: '600' },
});
