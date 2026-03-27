import { AdminHeader } from '@/components/admin/AdminHeader';
import { SkeletonLoader } from '@/components/admin/SkeletonLoader';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Platform } from 'react-native';

const C = AuthTheme.colors;

interface Order {
    id: string;
    status: string;
    dining_option: string;
    created_at: string;
    user: { full_name: string; phone: string } | null;
    order_items: { dish: { name: string; price: number }; quantity: number }[];
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState('Restaurant');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'ONGOING' | 'COMPLETED'>('ALL');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/restaurants');
            if (res.ok) {
                const data = await res.json();
                if (data?.length > 0) {
                    const id = data[0].id;
                    setRestaurantId(id);
                    setRestaurantName(data[0].name || 'Restaurant');
                    await fetchOrders(id);
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchOrders = async (id: string) => {
        try {
            const res = await fetch(`/api/restaurants/${id}/orders`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setOrders(data);
            }
        } catch (e) { console.error(e); }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (restaurantId) await fetchOrders(restaurantId);
        setRefreshing(false);
    };

    const getTimeAgo = (d: string) => {
        const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const h = Math.floor(mins / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const getStatusColor = (s: string) => {
        const m: Record<string, string> = { PENDING: '#FF7A28', CONFIRMED: '#181924', PREPARING: '#FF7A28', READY: '#181924', COMPLETED: '#181924', CANCELLED: '#9E9E9E' };
        return m[s] || '#9E9E9E';
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'ONGOING') return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status);
        if (filter === 'COMPLETED') return ['COMPLETED', 'CANCELLED'].includes(o.status);
        return true;
    });

    const getTotal = (items: Order['order_items']) =>
        items.reduce((s, it) => s + (it.dish?.price || 0) * (it.quantity || 1), 0);

    const filterTabs: { key: typeof filter; label: string }[] = [
        { key: 'ALL', label: 'All Orders' },
        { key: 'ONGOING', label: 'Ongoing' },
        { key: 'COMPLETED', label: 'Completed' },
    ];

    if (loading) {
        return (
            <View style={styles.container}>
                <AdminHeader restaurantName="Restaurant" />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {[1, 2, 3, 4].map(i => <SkeletonLoader.OrderCard key={i} />)}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AdminHeader
                restaurantName={restaurantName}
                title="Order History"
                subtitle="Review and track your recent culinary journeys"
            />

            {/* Filter Tabs */}
            <View style={{ height: 65, backgroundColor: C.backgroundGrey }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {filterTabs.map(tab => {
                        const active = filter === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.filterChip, active && styles.filterChipActive]}
                                onPress={() => setFilter(tab.key)}
                            >
                                <Text style={[styles.filterText, active && styles.filterTextActive]}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
            >
                {filteredOrders.map(order => {
                    const total = getTotal(order.order_items);
                    return (
                        <View key={order.id} style={styles.orderCard}>
                            {/* Top Row */}
                            <View style={styles.cardTopRow}>
                                <View style={styles.customerAvatar}>
                                    <Ionicons name="person" size={20} color={C.textGrey} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <View style={styles.idStatusRow}>
                                        <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '18' }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                                {order.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.customerName}>{order.user?.full_name || 'Guest'}</Text>
                                    <View style={styles.metaRow}>
                                        <Ionicons
                                            name={order.dining_option === 'DINE_IN' ? 'restaurant-outline' : 'bag-outline'}
                                            size={12}
                                            color={C.textGrey}
                                        />
                                        <Text style={styles.metaText}>
                                            {order.dining_option === 'DINE_IN' ? 'Dine-in' : 'Pickup'}
                                        </Text>
                                        <Ionicons name="time-outline" size={12} color={C.textGrey} />
                                        <Text style={styles.metaText}>{getTimeAgo(order.created_at)}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Total */}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalAmount}>₹{total.toFixed(0)}</Text>
                                <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                            </View>

                            {/* Items */}
                            {expandedOrderId === order.id && (
                                <View style={styles.itemsBox}>
                                    {order.order_items.map((item, idx) => (
                                        <View key={idx} style={styles.itemRow}>
                                            <Ionicons name="restaurant-outline" size={14} color={C.primary} />
                                            <Text style={styles.itemName}>{item.dish?.name || 'Unknown'}</Text>
                                            <Text style={styles.itemQty}>x{item.quantity}</Text>
                                            <Text style={styles.itemPrice}>₹{((item.dish?.price || 0) * (item.quantity || 1)).toFixed(0)}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity 
                                style={styles.viewDetails} 
                                onPress={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            >
                                <Text style={styles.viewDetailsText}>
                                    {expandedOrderId === order.id ? 'Hide Details  ‹' : 'View Details  ›'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {filteredOrders.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={48} color={C.textGrey} />
                        <Text style={styles.emptyText}>No orders found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.backgroundGrey },
    scrollContent: { padding: 20, paddingBottom: 40 },

    filterRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center' },
    filterChip: { height: 40, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center' },
    filterChipActive: { backgroundColor: C.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
    filterTextActive: { color: C.white },

    orderCard: {
        backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 16,
        ...Platform.select({
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
            default: { elevation: 2 },
        }),
    },
    cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    customerAvatar: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F0F0',
        justifyContent: 'center', alignItems: 'center',
    },
    idStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    orderId: { fontSize: 14, fontWeight: '700', color: C.darkNavy, letterSpacing: 0.3 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '700' },
    customerName: { fontSize: 16, fontWeight: '700', color: C.darkNavy, marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: C.textGrey, marginRight: 8 },

    totalRow: { alignItems: 'flex-end', marginBottom: 16, paddingRight: 4 },
    totalAmount: { fontSize: 24, fontWeight: '900', color: C.primary, letterSpacing: -0.5 },
    totalLabel: { fontSize: 9, color: C.textGrey, fontWeight: '700', letterSpacing: 1, marginTop: -2 },

    itemsBox: {
        backgroundColor: '#FAFAFA', borderRadius: 10, padding: 14,
        borderWidth: 1, borderColor: '#F0F0F0',
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    itemName: { flex: 1, fontSize: 14, fontWeight: '600', color: C.darkNavy },
    itemQty: { fontSize: 14, color: C.primary, fontWeight: '700' },
    itemPrice: { fontSize: 13, color: C.textGrey, fontWeight: '600', minWidth: 50, textAlign: 'right' as const },
    viewDetails: { marginTop: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 8 },
    viewDetailsText: { fontSize: 13, color: C.primary, fontWeight: '600' },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 10, color: C.textGrey, fontSize: 14 },
});
