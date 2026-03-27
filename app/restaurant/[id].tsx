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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@/lib/UserContext';
import { useCart } from '@/lib/CartContext';
import Skeleton from '@/components/ui/Skeleton';
import { 
  getRestaurantDetails, 
  getRestaurantCritics, 
  getRestaurantOffers 
} from '@/api/restaurantApi';
import Toast from '@/components/Toast';

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
  cooking_method?: string;
  recommended_for?: string;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Offer {
  id: string;
  title: string;
  discount_percent: number;
  valid_from: string;
  valid_to: string;
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
  const { addItem, items, getItemQty } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isBookingVisible, setBookingVisible] = useState(false);
  const [guests, setGuests] = useState('2');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Dish Details state
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isDishDetailsVisible, setDishDetailsVisible] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Critics & Offers state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showCriticsOverlay, setShowCriticsOverlay] = useState(false);
  const [showOffersOverlay, setShowOffersOverlay] = useState(false);

  useEffect(() => {
    fetchEverything();
  }, [restaurantId]);

  const fetchEverything = async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      const [restDetails, criticsData, offersData] = await Promise.all([
        getRestaurantDetails(restaurantId),
        getRestaurantCritics(restaurantId),
        getRestaurantOffers(restaurantId),
      ]);

      if (restDetails) {
        setRestaurant({
          id: restDetails.id,
          name: restDetails.name || 'Restaurant',
          description: restDetails.description || 'Delicious food awaits you',
          address: restDetails.address || '',
          phone: restDetails.phone || '',
          latitude: Number(restDetails.latitude) || 0,
          longitude: Number(restDetails.longitude) || 0,
          image_url: restDetails.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
          cuisine: restDetails.cuisine || ['Indian', 'Continental'],
          rating: 4.5,
          deliveryTime: '25 min',
        });

        if (restDetails.dishes) {
          const items: MenuItem[] = restDetails.dishes.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description || 'Tasty dish',
            price: Number(d.price) || 0,
            category: d.recommended_for || d.category || 'Main Course',
            image_url: d.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            allergens: d.allergens ? [d.allergens] : [],
            ingredients: [d.cooking_method || 'Fresh ingredients'],
            calories: d.calories || 300,
          }));
          setMenuItems(items);
        }
      }

      setReviews(criticsData);
      setOffers(offersData);
      console.log('--- FETCH SUCCESS ---');
      console.log('Restaurant Name:', restDetails.name);
      console.log('Restaurant ID:', restaurantId);
      console.log('---------------------');
      
    } catch (error) {
      console.error('Error fetching restaurant page data:', error);
      Alert.alert('Error', 'Failed to load restaurant data. Please check your connection.');
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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    });
    showToast(`${item.name} added to cart`);
  };

  const handleOpenMap = () => {
    if (!restaurant) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Ionicons
                key={i}
                name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
                size={14}
                color="#FF7A00"
            />
        );
    }
    return <View style={{ flexDirection: 'row', gap: 2 }}>{stars}</View>;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ height: 260 }}>
          <Skeleton width="100%" height="100%" borderRadius={0} />
        </View>
        <View style={{ padding: 20 }}>
          <Skeleton width="80%" height={28} style={{ marginBottom: 12 }} />
          <Skeleton width="60%" height={16} style={{ marginBottom: 20 }} />
          
          <View style={{ flexDirection: 'row', gap: 15, marginBottom: 30 }}>
            <Skeleton width={80} height={36} borderRadius={18} />
            <Skeleton width={80} height={36} borderRadius={18} />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={{ width: '48%', marginBottom: 20 }}>
                <Skeleton width="100%" height={120} borderRadius={16} />
                <Skeleton width="80%" height={16} style={{ marginTop: 10 }} />
                <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="restaurant-outline" size={48} color="#D0D5DD" />
          <Text style={styles.loadingText}>Restaurant not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Toast
        visible={toastVisible}
        message={toastMsg}
        type="success"
        duration={1000}
        onHide={() => setToastVisible(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{restaurant.name}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/cart' as any)}>
          <Ionicons name="cart-outline" size={22} color="#181C2E" />
          {cartItemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContainer}>
            <Image source={{ uri: restaurant.image_url }} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
                <TouchableOpacity style={styles.heroMapBtn} onPress={handleOpenMap}>
                    <Ionicons name="location" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.mainInfo}>
            <View style={styles.infoRow}>
                <Text style={styles.resName}>{restaurant.name}</Text>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFF" />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                </View>
            </View>
            <Text style={styles.cuisineText}>{restaurant.cuisine.join(' • ')}</Text>
            <Text style={styles.descText} numberOfLines={3}>{restaurant.description}</Text>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Ionicons name="time" size={16} color="#FF7A00" />
                    <Text style={styles.statValue}>{restaurant.deliveryTime}</Text>
                    <Text style={styles.statLabel}>Delivery</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Ionicons name="navigate" size={16} color="#FF7A00" />
                    <Text style={styles.statValue}>2.4 km</Text>
                    <Text style={styles.statLabel}>Distance</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Ionicons name="restaurant" size={16} color="#FF7A00" />
                    <Text style={styles.statValue}>{menuItems.length}</Text>
                    <Text style={styles.statLabel}>Items</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={[styles.actionBtn, { flex: 1.2 }]} 
                    onPress={() => setBookingVisible(true)}
                >
                    <MaterialCommunityIcons name="table-furniture" size={20} color="#FFF" />
                    <Text style={styles.actionBtnText}>Book Table</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionBtnOutline} 
                    onPress={() => setShowCriticsOverlay(!showCriticsOverlay)}
                >
                    <Ionicons name="chatbubbles" size={18} color="#FF7A00" />
                    <Text style={styles.actionBtnOutlineText}>Critics</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionBtnOutline}
                    onPress={() => setShowOffersOverlay(!showOffersOverlay)}
                >
                    <Ionicons name="pricetag-outline" size={20} color="#FF7A00" />
                    <Text style={styles.actionBtnOutlineText}>Offers</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* ─── Dynamic Critics Section (Top) ─── */}
        {showCriticsOverlay && reviews.length > 0 && (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Critics</Text>
                    <TouchableOpacity onPress={() => setShowCriticsOverlay(false)}>
                        <Ionicons name="close-circle" size={20} color="#D0D5DD" />
                    </TouchableOpacity>
                </View>
                {reviews.slice(0, 3).map((review) => (
                    <View key={review.id} style={styles.reviewMiniCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.avatarMini}><Text style={styles.avatarTxtMini}>{String(review.user_name).charAt(0)}</Text></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.miniReviewName}>{review.user_name}</Text>
                                {renderStars(review.rating)}
                            </View>
                        </View>
                        <Text style={styles.miniReviewComment} numberOfLines={2}>{review.comment}</Text>
                    </View>
                ))}
            </View>
        )}

        {/* ─── Dynamic Offers Section ─── */}
        {showOffersOverlay && (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Exclusive Offers</Text>
                    <TouchableOpacity onPress={() => setShowOffersOverlay(false)}>
                        <Ionicons name="close-circle" size={20} color="#D0D5DD" />
                    </TouchableOpacity>
                </View>
                {offers.length > 0 ? offers.map((offer) => (
                    <View key={offer.id} style={styles.offerMiniCard}>
                        <View style={styles.offerIconWrap}><Ionicons name="gift" size={18} color="#166534" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.offerMiniTitle}>{offer.title}</Text>
                            <Text style={styles.offerMiniMeta}>{offer.discount_percent}% OFF • Until {new Date(offer.valid_to).toLocaleDateString()}</Text>
                        </View>
                    </View>
                )) : (
                    <Text style={styles.emptyTxtMini}>No active offers for this restaurant.</Text>
                )}
            </View>
        )}

        {/* ─── Category Selection ─── */}
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
        >
            {categories.map((cat) => (
                <TouchableOpacity 
                    key={cat} 
                    style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
                    onPress={() => setSelectedCategory(cat)}
                >
                    <Text style={[styles.catBtnText, selectedCategory === cat && styles.catBtnTextActive]}>{cat}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>

        {/* ─── Menu Grid ─── */}
        <View style={styles.menuGrid}>
            {filteredItems.map((item) => {
                const itemQty = getItemQty(item.id);
                const isAllergen = hasAllergen(item);
                
                return (
                    <TouchableOpacity 
                        key={item.id} 
                        style={[styles.dishCard, isAllergen && styles.dishCardAllergen]}
                        onPress={() => {
                            setSelectedDish(item);
                            setDishDetailsVisible(true);
                        }}
                    >
                        <View style={styles.dishImageWrap}>
                            <Image source={{ uri: item.image_url }} style={styles.dishImage} />
                            {itemQty > 0 && (
                                <View style={styles.dishQtyBadge}><Text style={styles.dishQtyText}>{itemQty}</Text></View>
                            )}
                            {isAllergen && (
                                <View style={styles.allergenBadge}><Ionicons name="warning" size={12} color="#FFF" /></View>
                            )}
                        </View>
                        <View style={styles.dishInfo}>
                            <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.dishMetaRow}>
                                <Text style={styles.dishPrice}>₹{item.price}</Text>
                                {item.calories && <Text style={styles.dishCal}><Ionicons name="flame" size={10} color="#FF7A00" /> {item.calories} kcal</Text>}
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.dishAddBtn, isAllergen && { backgroundColor: '#EF4444' }]} 
                                onPress={(e) => {
                                    e.stopPropagation(); // Prevent opening modal
                                    handleAddToCart(item);
                                }}
                            >
                                <Ionicons name="add" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>

        {/* ─── Final Bottom Critics Section ─── */}
        <View style={[styles.sectionContainer, { marginTop: 40 }]}>
            <Text style={styles.mainSectionTitle}>Customer Reviews ({reviews.length})</Text>
            {reviews.map((review) => (
                <View key={review.id} style={styles.fullReviewCard}>
                    <View style={styles.reviewHeader}>
                        <View style={styles.avatarLarge}><Text style={styles.avatarTxtLarge}>{String(review.user_name).charAt(0)}</Text></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fullReviewName}>{review.user_name}</Text>
                            {renderStars(review.rating)}
                        </View>
                        <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.fullReviewComment}>{review.comment}</Text>
                </View>
            ))}
        </View>
      </ScrollView>

      {/* ─── Booking Modal ─── */}
      <Modal animationType="slide" transparent visible={isBookingVisible}>
          <View style={styles.modalBg}>
              <View style={styles.modalContent}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Reservation</Text>
                    <Text style={styles.modalSub}>Book your premium table at {restaurant.name}</Text>
                    
                    <Text style={styles.inputLabel}>Number of Guests</Text>
                    <TextInput 
                        style={styles.modalInput} 
                        value={guests} 
                        onChangeText={setGuests} 
                        keyboardType="numeric"
                        placeholder="e.g. 2"
                    />

                    <Text style={styles.inputLabel}>Select Time</Text>
                    <View style={styles.slotContainer}>
                        {['19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                            <TouchableOpacity 
                                key={t} 
                                style={[styles.slotBtn, selectedSlot === t && styles.slotBtnActive]}
                                onPress={() => setSelectedSlot(t)}
                            >
                                <Text style={[styles.slotText, selectedSlot === t && styles.slotTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={styles.modalConfirmBtn} 
                        onPress={() => {
                            Alert.alert('Success', `Table booked for ${guests} guests at ${selectedSlot}`);
                            setBookingVisible(false);
                        }}
                    >
                        <Text style={styles.modalConfirmText}>Confirm Booking</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setBookingVisible(false)}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* ─── Dish Details Modal ─── */}
      <Modal animationType="slide" transparent visible={isDishDetailsVisible && !!selectedDish}>
          <View style={styles.modalBg}>
              <TouchableOpacity activeOpacity={1} style={{ flex: 1, width: '100%' }} onPress={() => setDishDetailsVisible(false)} />
              <View style={styles.dishDetailsCardFull}>
                    <View style={styles.dishDetailsImgWrapFull}>
                        <Image source={{ uri: selectedDish?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' }} style={styles.dishDetailsImg} />
                        <TouchableOpacity style={styles.closeDishBtn} onPress={() => setDishDetailsVisible(false)}>
                            <Ionicons name="close" size={24} color="#181C2E" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.dishDetailsBodyScroll} 
                        contentContainerStyle={styles.dishDetailsBodyContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.dishDetailsHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.dishDetailsName}>{selectedDish?.name}</Text>
                                <View style={styles.dishDetailsSubHeader}>
                                    <Text style={styles.dishDetailsCategory}>{selectedDish?.category}</Text>
                                    <View style={styles.dotSeparator} />
                                    <Text style={styles.dishDetailsRecommended}>For: {selectedDish?.recommended_for || 'Lunch & Dinner'}</Text>
                                </View>
                            </View>
                            <Text style={styles.dishDetailsPrice}>₹{selectedDish?.price}</Text>
                        </View>

                        <Text style={styles.dishDetailsDescription}>
                            {selectedDish?.description || "A delicious dish carefully prepared with fresh ingredients to satisfy your cravings."}
                        </Text>

                        <View style={styles.dishDetailsStats}>
                            <View style={styles.dishStatBox}>
                                <Ionicons name="flame-outline" size={18} color="#FF7A00" />
                                <Text style={styles.dishStatValue}>{selectedDish?.calories || 450}</Text>
                                <Text style={styles.dishStatLabel}>Calories (kcal)</Text>
                            </View>
                            <View style={styles.vDivider} />
                            <View style={styles.dishStatBox}>
                                <Ionicons name="restaurant-outline" size={18} color="#FF7A00" />
                                <Text style={styles.dishStatValue}>{selectedDish?.cooking_method || 'Classic'}</Text>
                                <Text style={styles.dishStatLabel}>Method</Text>
                            </View>
                        </View>

                        <View style={styles.detailsSection}>
                            <Text style={styles.detailsSectionTitle}>Ingredients</Text>
                            <View style={styles.ingredientChips}>
                                {(selectedDish?.ingredients || ['Fresh Spices', 'Organic Herbs', 'Chef Secret Sauce']).map((ing, i) => (
                                    <View key={i} style={styles.ingredientChip}>
                                        <Text style={styles.ingredientChipText}>{ing}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {selectedDish?.cooking_method && (
                            <View style={styles.detailsSection}>
                                <Text style={styles.detailsSectionTitle}>Preparation Note</Text>
                                <Text style={styles.detailsSectionText}>{selectedDish.cooking_method}</Text>
                            </View>
                        )}

                        <TouchableOpacity 
                            style={styles.dishAddFullBtn}
                            onPress={() => {
                                handleAddToCart(selectedDish!);
                                setDishDetailsVisible(false);
                            }}
                        >
                            <Ionicons name="cart-outline" size={20} color="#FFF" />
                            <Text style={styles.dishAddFullText}>Add to Cart • ₹{selectedDish?.price}</Text>
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>
              </View>
          </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 14, color: '#A0A5BA', fontSize: 14, fontWeight: '500' },
  backButton: { marginTop: 20, backgroundColor: '#FF7A00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  backButtonText: { color: '#FFF', fontWeight: '700' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FBFCFF',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#181C2E', flex: 1, marginHorizontal: 14, textAlign: 'center' },
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
    borderColor: '#FBFCFF',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  scrollContent: { paddingBottom: 60 },

  heroContainer: { marginHorizontal: 20, height: 220, borderRadius: 28, overflow: 'hidden', backgroundColor: '#F0F5FA' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, padding: 16, alignItems: 'flex-end' },
  heroMapBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(24,28,46,0.6)', alignItems: 'center', justifyContent: 'center' },

  mainInfo: { paddingHorizontal: 20, marginTop: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resName: { fontSize: 26, fontWeight: '900', color: '#181C2E' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF7A00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  ratingText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  cuisineText: { fontSize: 14, color: '#FF7A00', fontWeight: '700', marginTop: 4 },
  descText: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginTop: 12 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: '#181C2E', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#A0A5BA', fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: '#F0F5FA' },

  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionBtn: { 
    flexDirection: 'row', backgroundColor: '#FF7A00', borderRadius: 16,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8,
    elevation: 4, shadowColor: '#FF7A00', shadowOpacity: 0.2,
  },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  actionBtnOutline: {
    flex: 1, flexDirection: 'row', backgroundColor: '#FFF4E5', borderRadius: 16,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#FFE2C5',
  },
  actionBtnOutlineText: { color: '#FF7A00', fontWeight: '800', fontSize: 13 },

  sectionContainer: { marginHorizontal: 20, marginTop: 24, backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#181C2E' },
  mainSectionTitle: { fontSize: 19, fontWeight: '800', color: '#181C2E', marginBottom: 16 },

  reviewMiniCard: { backgroundColor: '#F8F9FB', borderRadius: 16, padding: 14, marginBottom: 10 },
  avatarMini: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF7A00', alignItems: 'center', justifyContent: 'center' },
  avatarTxtMini: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  miniReviewName: { fontSize: 13, fontWeight: '700', color: '#181C2E' },
  miniReviewComment: { fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 18 },

  offerMiniCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14, marginBottom: 10 },
  offerIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  offerMiniTitle: { fontSize: 14, fontWeight: '700', color: '#181C2E' },
  offerMiniMeta: { fontSize: 11, color: '#166534', fontWeight: '600' },
  emptyTxtMini: { fontSize: 13, color: '#A0A5BA', textAlign: 'center', padding: 10 },

  categoryScroll: { paddingHorizontal: 20, marginTop: 30, gap: 10 },
  catBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#F0F5FA' },
  catBtnActive: { backgroundColor: '#181C2E', borderColor: '#181C2E' },
  catBtnText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  catBtnTextActive: { color: '#FFF' },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginTop: 20 },
  dishCard: { width: (width - 50) / 2, backgroundColor: '#FFF', borderRadius: 24, padding: 10, marginBottom: 20, marginHorizontal: 5, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  dishCardAllergen: { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FEF2F2' },
  dishImageWrap: { height: 110, borderRadius: 18, overflow: 'hidden', backgroundColor: '#F0F5FA' },
  dishImage: { width: '100%', height: '100%' },
  dishQtyBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FF7A00', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  dishQtyText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  allergenBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#EF4444', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dishInfo: { padding: 10 },
  dishName: { fontSize: 15, fontWeight: '800', color: '#181C2E' },
  dishMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dishPrice: { fontSize: 13, fontWeight: '800', color: '#FF7A00' },
  dishCal: { fontSize: 10, color: '#A0A5BA', fontWeight: '600' },
  dishAddBtn: { position: 'absolute', bottom: -4, right: -4, width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF7A00', alignItems: 'center', justifyContent: 'center', elevation: 2, zIndex: 10 },

  fullReviewCard: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F5FA', paddingBottom: 20 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarLarge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F5FA', alignItems: 'center', justifyContent: 'center' },
  avatarTxtLarge: { color: '#FF7A00', fontWeight: '900', fontSize: 16 },
  fullReviewName: { fontSize: 15, fontWeight: '800', color: '#181C2E' },
  reviewDate: { fontSize: 12, color: '#A0A5BA' },
  fullReviewComment: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginTop: 10 },

  modalBg: { flex: 1, backgroundColor: 'rgba(24,28,46,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D5DD', alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#181C2E', textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#A0A5BA', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#181C2E', marginBottom: 8, marginLeft: 4 },
  modalInput: { backgroundColor: '#F0F5FA', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '600', marginBottom: 20 },
  slotContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  slotBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F0F5FA', borderWidth: 1.5, borderColor: '#F0F5FA' },
  slotBtnActive: { backgroundColor: '#FF7A00', borderColor: '#FF7A00' },
  slotText: { fontWeight: '700', color: '#181C2E' },
  slotTextActive: { color: '#FFF' },
  modalConfirmBtn: { backgroundColor: '#FF7A00', borderRadius: 20, paddingVertical: 18, alignItems: 'center', elevation: 4 },
  modalConfirmText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  modalCancelBtn: { alignItems: 'center', marginTop: 16 },
  modalCancelText: { color: '#A0A5BA', fontWeight: '700' },

  // Dish Details Modal
  dishDetailsCardFull: { width: '100%', height: '85%', backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', elevation: 10, alignSelf: 'flex-end', marginTop: 'auto' },
  dishDetailsImgWrapFull: { height: 250, width: '100%', position: 'relative' },
  dishDetailsImg: { width: '100%', height: '100%' },
  closeDishBtn: { position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  dishDetailsBodyScroll: { flex: 1 },
  dishDetailsBodyContent: { padding: 24, paddingBottom: 60 },
  dishDetailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  dishDetailsName: { fontSize: 24, fontWeight: '900', color: '#181C2E' },
  dishDetailsSubHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  dishDetailsCategory: { fontSize: 13, fontWeight: '700', color: '#FF7A00' },
  dishDetailsRecommended: { fontSize: 12, fontWeight: '600', color: '#A0A5BA' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D0D5DD' },
  dishDetailsPrice: { fontSize: 24, fontWeight: '900', color: '#181C2E' },
  dishDetailsDescription: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginVertical: 16 },
  dishDetailsStats: { flexDirection: 'row', backgroundColor: '#F8F9FB', borderRadius: 24, padding: 18, marginBottom: 20, alignItems: 'center', gap: 10 },
  dishStatBox: { flex: 1, alignItems: 'center' },
  dishStatValue: { fontSize: 15, fontWeight: '800', color: '#181C2E', marginTop: 4 },
  dishStatLabel: { fontSize: 10, color: '#A0A5BA', fontWeight: '600', textTransform: 'uppercase' },
  vDivider: { width: 1, height: 35, backgroundColor: '#E0E5ED' },
  detailsSection: { marginBottom: 20 },
  detailsSectionTitle: { fontSize: 16, fontWeight: '800', color: '#181C2E', marginBottom: 10 },
  ingredientChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientChip: { backgroundColor: '#F0F5FA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E0E5ED' },
  ingredientChipText: { fontSize: 13, fontWeight: '600', color: '#181C2E' },
  detailsSectionText: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  dishAddFullBtn: { flexDirection: 'row', backgroundColor: '#FF7A00', borderRadius: 20, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 4, marginTop: 10 },
  dishAddFullText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
