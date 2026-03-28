import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart, RestaurantCart } from '@/lib/CartContext';
import { createMultipleTakeawayOrders } from '@/api/orderApi';
import { notifyOrderStatus } from '@/utils/notifications';
import { initiateSecureUPIPayment, confirmPaymentOnServer, cancelPayment } from '@/lib/upiPayment';

const generateTimeSlots = (): string[] => {
  return [
    '10:00 AM',
    '12:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM',
    '09:00 PM',
    '10:00 PM',
    '11:00 PM',
    '12:00 AM'
  ];
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

  const handlePlaceOrder = async (group: RestaurantCart) => {
    if (!group.scheduledTime) {
      Alert.alert('Pickup Time Required', `Please select a pickup time for ${group.restaurantName}`);
      return;
    }

    setLoading(true);
    try {
      const amount = getTotalForRestaurant(group);

      // Step 1: Create order on server first (PENDING status)
      const orders = await createMultipleTakeawayOrders([group]);
      const orderId = orders[0]?.id;

      if (!orderId) {
        throw new Error('Failed to create order');
      }

      // Step 2: Initiate secure payment (auth + server record + open UPI)
      const paymentResult = await initiateSecureUPIPayment(
        amount,
        group.restaurantId,
        group.restaurantName,
        orderId
      );

      if (!paymentResult.success || !paymentResult.paymentId) {
        setLoading(false);
        return;
      }

      // Step 3: Ask user to confirm they completed payment in UPI app
      Alert.alert(
        'Payment Confirmation',
        'Did you successfully complete the payment in the UPI app?',
        [
          {
            text: 'No, Cancel',
            onPress: async () => {
              await cancelPayment(paymentResult.paymentId!);
              setLoading(false);
            },
            style: 'cancel',
          },
          {
            text: 'Yes, I Paid',
            onPress: async () => {
              try {
                // Step 4: Verify payment on server (anti-fraud gate)
                const verified = await confirmPaymentOnServer(
                  paymentResult.paymentId!,
                  paymentResult.transactionId!
                );

                if (!verified) {
                  Alert.alert(
                    'Verification Failed',
                    'Payment could not be verified. If you were charged, contact support with order ID: ' + orderId
                  );
                  setLoading(false);
                  return;
                }

                // Step 5: Only after server verification → mark order confirmed
                await notifyOrderStatus('CONFIRMED', orderId, group.restaurantName);

                Alert.alert('Success', `Order placed & payment verified for ${group.restaurantName}!`, [
                  {
                    text: 'View Orders',
                    onPress: () => {
                      clearRestaurantItems(group.restaurantId);
                      if (restaurantGroups.length === 1) {
                        router.push('/(tabs)/orders' as any);
                      }
                    },
                  },
                ]);
              } catch (e: any) {
                Alert.alert('Error', e.message || 'Verification failed');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

            <View style={styles.restaurantFooter}>
                <View style={styles.restaurantTotal}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>₹{getTotalForRestaurant(group).toFixed(2)}</Text>
                </View>
                
                <TouchableOpacity
                    style={[styles.placeOrderBtn, !group.scheduledTime && styles.placeOrderBtnDisabled]}
                    onPress={() => handlePlaceOrder(group)}
                    disabled={loading}
                >
                    <Text style={styles.placeOrderBtnText}>Place Order</Text>
                </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total ({restaurantGroups.length} Shops)</Text>
          <Text style={styles.grandTotalAmount}>₹{getGrandTotal().toFixed(2)}</Text>
        </View>
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
    paddingTop: 20, // Increased
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
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
  restaurantFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F5FA',
    gap: 12,
  },
  restaurantTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeOrderBtn: {
    backgroundColor: '#181C2E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  placeOrderBtnDisabled: {
    backgroundColor: '#A0A5BA',
  },
  placeOrderBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0A5BA',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#181C2E',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F5FA',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A0A5BA',
  },
  grandTotalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF7A00',
  },
});
