import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart, RestaurantCart } from '@/lib/CartContext';
import { createMultipleTakeawayOrders } from '@/api/orderApi';

const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  let startHour = currentHour;
  let startMinute = currentMinute + 30;
  
  if (startMinute >= 60) {
    startHour += 1;
    startMinute = 0;
  }
  
  for (let i = 0; i < 12; i++) {
    const hour = startHour + i;
    if (hour >= 24) break;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const minute = startMinute === 0 ? '00' : startMinute;
    
    slots.push(`${displayHour}:${minute} ${period}`);
  }
  
  return slots;
};

export default function CartPage() {
  const router = useRouter();
  const { getGroupedByRestaurant, removeItem, updateItemQty, setScheduledTime, clearCart, clearRestaurantItems } = useCart();
  
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const restaurantGroups = useMemo(() => getGroupedByRestaurant(), [getGroupedByRestaurant]);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const getTotalForRestaurant = (group: RestaurantCart) => {
    return group.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const getGrandTotal = () => {
    return restaurantGroups.reduce((sum, group) => sum + getTotalForRestaurant(group), 0);
  };

  const handleTimeSelect = (restaurantId: string, time: string) => {
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let hour = hours;
    if (period === 'PM' && hours !== 12) hour += 12;
    if (period === 'AM' && hours === 12) hour = 0;
    
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minutes, 0, 0);
    
    if (scheduledDate <= new Date()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    setScheduledTime(restaurantId, scheduledDate);
    setShowTimePicker(null);
  };

  const handleCheckout = async () => {
    if (restaurantGroups.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    const missingTime = restaurantGroups.filter((g) => !g.scheduledTime);
    if (missingTime.length > 0) {
      Alert.alert(
        'Pickup Time Required',
        `Please select a pickup time for: ${missingTime.map((g) => g.restaurantName).join(', ')}`
      );
      return;
    }

    setLoading(true);
    try {
      await createMultipleTakeawayOrders(restaurantGroups);
      Alert.alert('Success', 'Your orders have been placed!', [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.push('/(tabs)/orders' as any);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const formatScheduledTime = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (restaurantGroups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/explore' as any)}
          >
            <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {restaurantGroups.map((group) => (
          <View key={group.restaurantId} style={styles.restaurantSection}>
            <View style={styles.restaurantHeader}>
              <View>
                <Text style={styles.restaurantName}>{group.restaurantName}</Text>
                <Text style={styles.itemCount}>{group.items.length} items</Text>
              </View>
              <TouchableOpacity onPress={() => clearRestaurantItems(group.restaurantId)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeSelector}>
              <Ionicons name="time-outline" size={18} color="#FF7A00" />
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(group.restaurantId)}
              >
                <Text style={group.scheduledTime ? styles.timeSelected : styles.timePlaceholder}>
                  {group.scheduledTime
                    ? `Pickup at ${formatScheduledTime(group.scheduledTime)}`
                    : 'Select pickup time'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {showTimePicker === group.restaurantId && (
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      group.scheduledTime?.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }) === time && styles.timeSlotSelected,
                    ]}
                    onPress={() => handleTimeSelect(group.restaurantId, time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        group.scheduledTime?.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }) === time && styles.timeSlotTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {group.items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateItemQty(item.id, item.qty - 1)}
                  >
                    <Ionicons name="remove" size={16} color="#FF7A00" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateItemQty(item.id, item.qty + 1)}
                  >
                    <Ionicons name="add" size={16} color="#FF7A00" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.restaurantTotal}>
              <Text style={styles.totalLabel}>Restaurant Total</Text>
              <Text style={styles.totalAmount}>₹{getTotalForRestaurant(group).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalAmount}>₹{getGrandTotal().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkout, loading && styles.checkoutDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutText}>
            {loading ? 'Placing Order...' : `Place Orders (${restaurantGroups.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#181C2E',
  },
  clearText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  restaurantSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#F8F9FB',
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181C2E',
  },
  itemCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  timePlaceholder: {
    color: '#666',
    fontSize: 14,
  },
  timeSelected: {
    color: '#FF7A00',
    fontWeight: '700',
    fontSize: 14,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSlotSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  timeSlotText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#181C2E',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
    color: '#181C2E',
  },
  restaurantTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#181C2E',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F3F3',
    backgroundColor: '#fff',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181C2E',
  },
  grandTotalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF7A00',
  },
  checkout: {
    backgroundColor: '#181C2E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutDisabled: {
    opacity: 0.6,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
