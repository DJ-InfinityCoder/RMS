import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SkeletonLoader } from '@/components/admin/SkeletonLoader';

const C = AuthTheme.colors;
const RESTAURANT_ID = 'aa88df4a-8740-4f51-872f-5732155f9889';

export default function TablesScreen() {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);

    const fetchRestaurantAndSlots = async () => {
        try {
            // First get the restaurant
            const restRes = await fetch('/api/restaurants');
            const restaurants = await restRes.json();
            if (restaurants.length > 0) {
                const id = restaurants[0].id;
                setRestaurantId(id);
                fetchSlots(id);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchSlots = async (id: string) => {
        try {
            const res = await fetch(`/api/restaurants/${id}/tables`);
            const data = await res.json();
            setSlots(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRestaurantAndSlots();
    }, []);

    const updateOccupancy = async (slotId: string, increment: boolean) => {
        if (!restaurantId) return;
        const slot = slots.find(s => s.id === slotId);
        if (!slot) return;
        
        const newSeats = increment ? slot.booked_seats + 1 : slot.booked_seats - 1;
        if (newSeats < 0 || newSeats > slot.total_seats) return;

        try {
            const res = await fetch(`/api/restaurants/${restaurantId}/tables`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slotId, booked_seats: newSeats }),
            });
            if (res.ok) fetchSlots(restaurantId);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        if (restaurantId) fetchSlots(restaurantId);
        else fetchRestaurantAndSlots();
    };

    const renderSlot = ({ item }: { item: any }) => {
        const occupancy = (item.booked_seats / item.total_seats) * 100;
        const barColor = occupancy > 80 ? '#F44336' : occupancy > 50 ? '#FF9800' : '#4CAF50';

        return (
            <View style={styles.card}>
                <View style={[styles.timeIndicator, { backgroundColor: C.primary + '10' }]}>
                    <Ionicons name="time-outline" size={20} color={C.primary} />
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>

                <View style={styles.details}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Seats Occupied</Text>
                        <Text style={styles.value}>{item.booked_seats} / {item.total_seats}</Text>
                    </View>

                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${occupancy}%`, backgroundColor: barColor }]} />
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity 
                            onPress={() => updateOccupancy(item.id, false)}
                            style={[styles.btn, { borderColor: '#E0E6ED' }]}
                        >
                            <Ionicons name="remove" size={20} color={C.darkNavy} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => updateOccupancy(item.id, true)}
                            style={[styles.btn, { backgroundColor: C.primary, borderColor: C.primary }]}
                        >
                            <Ionicons name="add" size={20} color={C.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AdminHeader restaurantName="Spice Cave" title="Table Management" />
            
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Daily Bookings</Text>
                
                {loading ? (
                    <View style={{ flex: 1 }}>
                        <SkeletonLoader.TableItem />
                        <SkeletonLoader.TableItem />
                        <SkeletonLoader.TableItem />
                        <SkeletonLoader.TableItem />
                    </View>
                ) : slots.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={C.textGrey} />
                        <Text style={styles.emptyText}>No table slots configured</Text>
                    </View>
                ) : (
                    <FlatList
                        data={slots}
                        renderItem={renderSlot}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.backgroundGrey },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: C.darkNavy, marginBottom: 15, letterSpacing: 0.3 },
    list: { paddingBottom: 40 },
    card: {
        backgroundColor: C.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    timeIndicator: {
        width: 76,
        height: 76,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    timeText: { fontSize: 13, fontWeight: '800', color: C.primary, marginTop: 4, textAlign: 'center' },
    details: { flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
    label: { fontSize: 12, color: C.textGrey, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 16, color: C.darkNavy, fontWeight: '800' },
    progressBg: { height: 8, backgroundColor: '#F0F2F5', borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
    progressFill: { height: '100%', borderRadius: 4 },
    controls: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    btn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 12, color: C.textGrey, fontSize: 15, fontWeight: '500' },
});
