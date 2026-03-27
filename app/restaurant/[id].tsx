import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { restaurants, Restaurant, MenuItem } from '@/data/restaurants';
import { useUser } from '@/lib/UserContext';
import { useCart } from '@/lib/CartContext';

const { width } = Dimensions.get('window');

export default function RestaurantPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = typeof params.id === 'string' ? params.id : '1';
  const restaurant = restaurants.find((r) => r.id === restaurantId) ?? restaurants[0];

  const { preferences } = useUser();
  const { addItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isBookingVisible, setBookingVisible] = useState(false);
  const [isOffersVisible, setOffersVisible] = useState(false);
  const [isCriticsVisible, setCriticsVisible] = useState(false);

  // Booking State
  const [guests, setGuests] = useState('2');
  const [selectedSlot, setSelectedSlot] = useState('');

  // ─── Categories from restaurant menu ──────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set<string>();
    restaurant.menuItems.forEach((m) => cats.add(m.category));
    return ['All', ...Array.from(cats)];
  }, [restaurant]);

  // ─── Filter & Allergen Detection ──────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let items = restaurant.menuItems;
    if (selectedCategory !== 'All') {
      items = items.filter((m) => m.category === selectedCategory);
    }
    return items;
  }, [restaurant, selectedCategory]);

  const hasAllergen = (item: MenuItem): boolean => {
    return item.allergens.some((a) =>
      preferences.allergies.some(
        (ua) => ua.toLowerCase() === a.toLowerCase()
      )
    );
  };

  const getMatchingAllergens = (item: MenuItem): string[] => {
    return item.allergens.filter((a) =>
      preferences.allergies.some(
        (ua) => ua.toLowerCase() === a.toLowerCase()
      )
    );
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddToCart = (item: MenuItem) => {
    if (hasAllergen(item)) {
      const allergens = getMatchingAllergens(item);
      Alert.alert(
        '⚠️ Allergen Warning',
        `This item contains: ${allergens.join(', ')}.\nAre you sure you want to add it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Anyway',
            onPress: () => {
              addItem({ id: item.id, name: item.name, price: item.price });
              Alert.alert('Added!', `${item.name} added to cart`);
            },
          },
        ]
      );
    } else {
      addItem({ id: item.id, name: item.name, price: item.price });
      Alert.alert('Added!', `${item.name} added to cart`);
    }
  };

  const handleBookTable = () => {
    if (!selectedSlot) {
      Alert.alert('Select Slot', 'Please select a time slot');
      return;
    }
    const slot = restaurant.tableSlots.find((s) => s.time === selectedSlot);
    if (!slot) return;

    const guestCount = parseInt(guests, 10) || 2;
    if (slot.bookedSeats + guestCount > slot.totalSeats) {
      Alert.alert('No Seats', 'Not enough seats available for this slot');
      return;
    }

    Alert.alert('Success', `Table booked for ${guestCount} guests at ${selectedSlot}!`);
    setBookingVisible(false);
  };

  const handleOpenMap = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurant Details</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleOpenMap}>
          <Ionicons name="map-outline" size={22} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <Image source={{ uri: restaurant.image }} style={styles.heroImage} />

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisineTags}>{restaurant.cuisine.join(' • ')}</Text>
          <Text style={styles.description}>{restaurant.description}</Text>

          {/* Stats */}
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
            <View style={styles.statItem}>
              <Ionicons name="call-outline" size={18} color="#FF7622" />
              <Text style={styles.statText}>{restaurant.phone.slice(-10)}</Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setBookingVisible(true)}>
              <MaterialCommunityIcons name="table-chair" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Book Table</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.secondaryBtn]} onPress={() => setOffersVisible(true)}>
              <MaterialCommunityIcons name="tag-outline" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Offers ({restaurant.offers.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.criticBtn]} onPress={() => setCriticsVisible(true)}>
              <FontAwesome5 name="medal" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Critics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Menu Section ──────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <Text style={styles.menuCount}>{filteredItems.length} items</Text>
        </View>

        {/* Allergen Warning */}
        {preferences.allergies.length > 0 && (
          <View style={styles.allergenBanner}>
            <Ionicons name="warning" size={16} color="#EF4444" />
            <Text style={styles.allergenBannerText}>
              Items with your allergens ({preferences.allergies.join(', ')}) are flagged 🚩
            </Text>
          </View>
        )}

        {/* Categories */}
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

        {/* Menu Items Grid */}
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
                    {/* Allergen Flag */}
                    {isAllergen && (
                      <View style={styles.allergenFlag}>
                        <Text style={styles.allergenFlagText}>🚩 {matchedAllergens.join(', ')}</Text>
                      </View>
                    )}

                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                      {/* Ingredients */}
                      <Text style={styles.cardIngredients} numberOfLines={1}>
                        {item.ingredients.join(' · ')}
                      </Text>

                      {/* Meta */}
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

        {/* ─── Reviews Section ───────────────────────────────────────── */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
          {restaurant.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Image source={{ uri: review.avatar }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.reviewName}>{review.user}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color="#FF7622"
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.writeReviewBtn}>
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── Booking Modal ─────────────────────────────────────────── */}
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
              {restaurant.tableSlots.map((slot) => {
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

      {/* ─── Offers Modal ──────────────────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={isOffersVisible}
        onRequestClose={() => setOffersVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Special Offers</Text>
            {restaurant.offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                </View>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{offer.code}</Text>
                </View>
              </View>
            ))}
            {restaurant.offers.length === 0 && (
              <Text style={styles.noItemsText}>No active offers right now</Text>
            )}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setOffersVisible(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Critics Modal ─────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={isCriticsVisible}
        onRequestClose={() => setCriticsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FontAwesome5 name="medal" size={24} color="#FFD700" style={{ marginRight: 10 }} />
              <Text style={styles.modalTitle}>Expert Critics</Text>
            </View>
            <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
              Verified reviews from authenticated food critics.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {restaurant.criticReviews.map((critic) => (
                <View key={critic.id} style={styles.criticCard}>
                  <View style={styles.criticHeader}>
                    <Image source={{ uri: critic.avatar }} style={styles.criticAvatar} />
                    <View>
                      <Text style={styles.criticName}>
                        {critic.name} <MaterialCommunityIcons name="check-decagram" size={14} color="#1DA1F2" />
                      </Text>
                      <Text style={styles.criticCredential}>{critic.credential}</Text>
                    </View>
                    <View style={styles.criticRatingBox}>
                      <Text style={styles.criticRatingText}>{critic.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.criticReviewText}>"{critic.review}"</Text>
                </View>
              ))}
              {restaurant.criticReviews.length === 0 && (
                <Text style={styles.noItemsText}>No critic reviews yet</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCriticsVisible(false)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E' },
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
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF7622',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  secondaryBtn: { backgroundColor: '#181C2E' },
  criticBtn: { backgroundColor: '#333', marginRight: 0 },
  actionButtonText: { color: '#FFF', fontWeight: '700', marginLeft: 6, fontSize: 12 },

  // Menu
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
  cardIngredients: { fontSize: 10, color: '#6B7280', marginBottom: 4 },
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

  // Reviews
  reviewsSection: { paddingHorizontal: 24, marginBottom: 30 },
  reviewCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FB',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  reviewName: { fontWeight: '700', color: '#181C2E', fontSize: 14 },
  reviewDate: { color: '#A0A5BA', fontSize: 12 },
  reviewComment: { color: '#666', fontSize: 13, marginTop: 4, lineHeight: 18 },
  writeReviewBtn: {
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#181C2E',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  writeReviewText: { fontWeight: '700', color: '#181C2E' },

  // Modals
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

  // Table Slots
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

  // Offers
  offerCard: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerTitle: { fontWeight: '700', fontSize: 16, color: '#FF7622' },
  offerDesc: { color: '#666', fontSize: 12, marginTop: 2 },
  codeBox: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FF7622',
  },
  codeText: { fontWeight: '700', color: '#FF7622' },

  // Critics
  criticCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  criticHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  criticAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  criticName: { fontSize: 15, fontWeight: '700', color: '#181C2E' },
  criticCredential: { fontSize: 12, color: '#FF7622', fontWeight: '600' },
  criticRatingBox: {
    marginLeft: 'auto',
    backgroundColor: '#181C2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  criticRatingText: { color: '#FFF', fontWeight: '700' },
  criticReviewText: { fontStyle: 'italic', color: '#444', lineHeight: 20 },

  noItemsText: { textAlign: 'center', color: '#999', marginTop: 20 },

  seeAll: { color: '#FF7622', fontWeight: '600' },
});
