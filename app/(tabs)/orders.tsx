import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Types ──────────────────────────────────────────────────────────────────

type OrderStatus = 'delivered' | 'on_the_way' | 'preparing' | 'cancelled';

interface OrderItem {
    id: string;
    restaurantName: string;
    restaurantImage: string;
    items: string[];
    total: string;
    status: OrderStatus;
    date: string;
    orderId: string;
    eta?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ORDERS: OrderItem[] = [
    {
        id: '1',
        restaurantName: 'Rose Garden Restaurant',
        restaurantImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=70',
        items: ['Veg Biryani', 'Raita', 'Gulab Jamun'],
        total: '₹450',
        status: 'on_the_way',
        date: 'Today, 10:45 AM',
        orderId: '#RMS20260001',
        eta: '15 min',
    },
    {
        id: '2',
        restaurantName: 'American Spicy Burger',
        restaurantImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=70',
        items: ['Double Smash Burger', 'Loaded Fries', 'Cola'],
        total: '₹380',
        status: 'preparing',
        date: 'Today, 10:20 AM',
        orderId: '#RMS20260002',
        eta: '25 min',
    },
    {
        id: '3',
        restaurantName: 'Pizza Palace',
        restaurantImage: 'https://images.unsplash.com/photo-1548365328-9f547fb09594?w=300&q=70',
        items: ['Pepperoni Pizza (L)', 'Garlic Bread'],
        total: '₹620',
        status: 'delivered',
        date: 'Yesterday, 8:30 PM',
        orderId: '#RMS20260003',
    },
    {
        id: '4',
        restaurantName: 'Rose Garden Restaurant',
        restaurantImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=70',
        items: ['Dal Makhani', 'Butter Naan x2', 'Kulfi'],
        total: '₹320',
        status: 'cancelled',
        date: '2 days ago',
        orderId: '#RMS20260004',
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    on_the_way: { label: 'On the Way', color: '#3B82F6', bg: '#EFF6FF', icon: 'bicycle-outline' },
    preparing: { label: 'Preparing', color: '#F59E0B', bg: '#FFFBEB', icon: 'restaurant-outline' },
    delivered: { label: 'Delivered', color: '#22C55E', bg: '#F0FDF4', icon: 'checkmark-circle-outline' },
    cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle-outline' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Orders() {
    const [tab, setTab] = useState<'active' | 'past'>('active');

    const activeOrders = ORDERS.filter(
        (o) => o.status === 'on_the_way' || o.status === 'preparing'
    );
    const pastOrders = ORDERS.filter(
        (o) => o.status === 'delivered' || o.status === 'cancelled'
    );
    const displayOrders = tab === 'active' ? activeOrders : pastOrders;

    const renderOrder = ({ item }: { item: OrderItem }) => {
        const cfg = STATUS_CONFIG[item.status];
        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.88}>
                <Image source={{ uri: item.restaurantImage }} style={styles.cardImage} />
                <View style={styles.cardBody}>
                    {/* Top Row */}
                    <View style={styles.cardTopRow}>
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            {item.restaurantName}
                        </Text>
                        <Text style={styles.orderDate}>{item.date}</Text>
                    </View>

                    {/* Order ID */}
                    <Text style={styles.orderId}>{item.orderId}</Text>

                    {/* Items */}
                    <Text style={styles.items} numberOfLines={1}>
                        {item.items.join(' · ')}
                    </Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Bottom Row */}
                    <View style={styles.cardBottomRow}>
                        {/* Status Pill */}
                        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                            <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                            {item.eta && (
                                <Text style={[styles.etaText, { color: cfg.color }]}> · {item.eta}</Text>
                            )}
                        </View>

                        {/* Total */}
                        <Text style={styles.total}>{item.total}</Text>
                    </View>

                    {/* Actions */}
                    {(item.status === 'delivered') && (
                        <TouchableOpacity style={styles.reorderBtn} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="repeat" size={15} color="#FFF" />
                            <Text style={styles.reorderText}>Reorder</Text>
                        </TouchableOpacity>
                    )}
                    {(item.status === 'on_the_way' || item.status === 'preparing') && (
                        <TouchableOpacity style={styles.trackBtn} activeOpacity={0.8}>
                            <Ionicons name="location-outline" size={15} color="#FF7A00" />
                            <Text style={styles.trackText}>Track Order</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
                <TouchableOpacity style={styles.filterIconBtn}>
                    <Ionicons name="filter-outline" size={22} color="#181C2E" />
                </TouchableOpacity>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
                    onPress={() => setTab('active')}
                >
                    <Text style={[styles.tabLabel, tab === 'active' && styles.tabLabelActive]}>
                        Active {activeOrders.length > 0 && `(${activeOrders.length})`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'past' && styles.tabBtnActive]}
                    onPress={() => setTab('past')}
                >
                    <Text style={[styles.tabLabel, tab === 'past' && styles.tabLabelActive]}>
                        Past Orders
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={displayOrders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrder}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="receipt-text-outline" size={60} color="#D0D5DD" />
                        <Text style={styles.emptyTitle}>No orders yet</Text>
                        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFF' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#181C2E' },
    filterIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F5FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#F0F5FA',
        borderRadius: 14,
        padding: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabBtnActive: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
    tabLabel: { fontSize: 14, fontWeight: '600', color: '#A0A5BA' },
    tabLabelActive: { color: '#181C2E' },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 18,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        flexDirection: 'row',
    },
    cardImage: { width: 90, height: '100%', backgroundColor: '#F0F5FA' },
    cardBody: { flex: 1, padding: 14 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    restaurantName: { fontSize: 15, fontWeight: '700', color: '#181C2E', flex: 1, marginRight: 8 },
    orderDate: { fontSize: 11, color: '#A0A5BA' },
    orderId: { fontSize: 11, color: '#A0A5BA', marginTop: 2, marginBottom: 6 },
    items: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
    divider: { height: 1, backgroundColor: '#F0F5FA', marginVertical: 10 },
    cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 4,
    },
    statusText: { fontSize: 12, fontWeight: '700' },
    etaText: { fontSize: 12, fontWeight: '600' },
    total: { fontSize: 16, fontWeight: '700', color: '#181C2E' },
    reorderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7A00',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
        gap: 5,
    },
    reorderText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    trackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FF7A00',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
        gap: 5,
    },
    trackText: { color: '#FF7A00', fontWeight: '700', fontSize: 13 },
    emptyState: { alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E', marginTop: 16 },
    emptySubtitle: { fontSize: 13, color: '#A0A5BA', marginTop: 6 },
});
