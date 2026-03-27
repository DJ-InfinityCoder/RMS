import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders, ORDER_STATUS_CONFIG, OrderStatus, Order } from '@/lib/OrderContext';
import { sendOrderStatusNotification } from '@/services/notificationService';

// ─── Component ───────────────────────────────────────────────────────────────

export default function Orders() {
    const { orders, updateOrderStatus, sortOrdersByTime } = useOrders();
    const [tab, setTab] = useState<'active' | 'past'>('active');
    const [sortLatest, setSortLatest] = useState(true);

    // ─── Filtered + Sorted Orders ────────────────────────────────────────────
    const displayOrders = useMemo(() => {
        const sorted = sortOrdersByTime(!sortLatest);
        if (tab === 'active') {
            return sorted.filter((o) => o.status === 'placed' || o.status === 'prepared');
        }
        return sorted.filter((o) => o.status === 'ready');
    }, [orders, tab, sortLatest]);

    const activeCount = orders.filter(
        (o) => o.status === 'placed' || o.status === 'prepared'
    ).length;

    // ─── Actions ─────────────────────────────────────────────────────────────
    const handleStatusAdvance = (order: Order) => {
        const nextStatus: Record<string, OrderStatus | null> = {
            placed: 'prepared',
            prepared: 'ready',
            ready: null,
        };
        const next = nextStatus[order.status];
        if (!next) return;

        updateOrderStatus(order.id, next);
        sendOrderStatusNotification(order.orderId, next);
    };

    const handleCallCustomerCare = (phone: string) => {
        Linking.openURL(`tel:${phone}`).catch(() => {
            Alert.alert('Error', 'Unable to make the call');
        });
    };

    // ─── Render Order Card ───────────────────────────────────────────────────
    const renderOrder = ({ item }: { item: Order }) => {
        const cfg = ORDER_STATUS_CONFIG[item.status];
        const canAdvance = item.status !== 'ready';

        return (
            <View style={styles.card}>
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
                        {item.items.map((i) => `${i.name} x${i.qty}`).join(' · ')}
                    </Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Bottom Row */}
                    <View style={styles.cardBottomRow}>
                        {/* Status Pill */}
                        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                            <Ionicons name={cfg.icon as any} size={13} color={cfg.color} />
                            <Text style={[styles.statusText, { color: cfg.color }]}>
                                {cfg.label}
                            </Text>
                        </View>

                        {/* Total */}
                        <Text style={styles.total}>₹{item.total}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        {/* Advance Status (demo) */}
                        {canAdvance && (
                            <TouchableOpacity
                                style={styles.advanceBtn}
                                onPress={() => handleStatusAdvance(item)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="arrow-forward-outline" size={14} color="#FFF" />
                                <Text style={styles.advanceBtnText}>
                                    {item.status === 'placed' ? 'Mark Prepared' : 'Mark Ready'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Customer Care */}
                        <TouchableOpacity
                            style={styles.careBtn}
                            onPress={() => handleCallCustomerCare(item.customerCareNumber)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call-outline" size={14} color="#FF7A00" />
                            <Text style={styles.careBtnText}>Customer Care</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
                <TouchableOpacity
                    style={styles.sortBtn}
                    onPress={() => setSortLatest((prev) => !prev)}
                >
                    <MaterialCommunityIcons
                        name={sortLatest ? 'sort-clock-descending-outline' : 'sort-clock-ascending-outline'}
                        size={22}
                        color="#181C2E"
                    />
                </TouchableOpacity>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
                    onPress={() => setTab('active')}
                >
                    <Text style={[styles.tabLabel, tab === 'active' && styles.tabLabelActive]}>
                        Active {activeCount > 0 && `(${activeCount})`}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'past' && styles.tabBtnActive]}
                    onPress={() => setTab('past')}
                >
                    <Text style={[styles.tabLabel, tab === 'past' && styles.tabLabelActive]}>
                        Completed
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
                        <Text style={styles.emptyTitle}>
                            {tab === 'active' ? 'No active orders' : 'No completed orders'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {tab === 'active'
                                ? 'Place an order to see it here'
                                : 'Your completed orders will appear here'}
                        </Text>
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
    sortBtn: {
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
    tabBtnActive: {
        backgroundColor: '#FFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
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
    total: { fontSize: 16, fontWeight: '700', color: '#181C2E' },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
        flexWrap: 'wrap',
    },
    advanceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7A00',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 5,
    },
    advanceBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
    careBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FF7A00',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 7,
        gap: 5,
    },
    careBtnText: { color: '#FF7A00', fontWeight: '700', fontSize: 12 },
    emptyState: { alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E', marginTop: 16 },
    emptySubtitle: { fontSize: 13, color: '#A0A5BA', marginTop: 6 },
});
