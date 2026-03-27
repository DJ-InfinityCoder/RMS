import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Linking,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders, OrderStatus, ORDER_STATUS_CONFIG } from '@/lib/OrderContext';

export default function Orders() {
    const { orders, loading, error, fetchOrders, sortOrdersByTime } = useOrders();
    const [tab, setTab] = useState<'active' | 'past'>('active');
    const [sortLatest, setSortLatest] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const activeStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];
    const completedStatuses: OrderStatus[] = ['COMPLETED', 'CANCELLED'];

    const displayOrders = useMemo(() => {
        const sorted = sortOrdersByTime(!sortLatest);
        if (tab === 'active') {
            return sorted.filter((o) => activeStatuses.includes(o.status));
        }
        return sorted.filter((o) => completedStatuses.includes(o.status));
    }, [orders, tab, sortLatest, sortOrdersByTime]);

    const activeCount = orders.filter((o) => activeStatuses.includes(o.status)).length;

    const handleCallCustomerCare = (phone: string) => {
        if (!phone) {
            Alert.alert('Error', 'Phone number not available');
            return;
        }
        Linking.openURL(`tel:${phone}`).catch(() => {
            Alert.alert('Error', 'Unable to make the call');
        });
    };

    const renderOrder = ({ item }: { item: typeof orders[0] }) => {
        const cfg = ORDER_STATUS_CONFIG[item.status] || ORDER_STATUS_CONFIG.PENDING;

        return (
            <View style={styles.card}>
                <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.restaurantName} numberOfLines={1}>
                                {item.restaurantName}
                            </Text>
                            <Text style={styles.orderId}>{item.orderId}</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                            <Ionicons name={cfg.icon as any} size={13} color={cfg.color} />
                            <Text style={[styles.statusText, { color: cfg.color }]}>
                                {cfg.label}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.orderDate}>{item.date}</Text>

                    {item.scheduledTime && (
                        <View style={styles.scheduledTimeRow}>
                            <Ionicons name="time-outline" size={14} color="#FF7A00" />
                            <Text style={styles.scheduledTimeText}>
                                Pickup: {new Date(item.scheduledTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.items} numberOfLines={2}>
                        {item.items.map((i) => `${i.name} x${i.qty}`).join(' · ')}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.cardBottomRow}>
                        <Text style={styles.total}>₹{item.total.toFixed(2)}</Text>

                        {item.customerCareNumber && (
                            <TouchableOpacity
                                style={styles.careBtn}
                                onPress={() => handleCallCustomerCare(item.customerCareNumber || '')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="call-outline" size={14} color="#FF7A00" />
                                <Text style={styles.careBtnText}>Customer Care</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchOrders}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7A00" />
                </View>
            ) : (
                <FlatList
                    data={displayOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#FF7A00']}
                        />
                    }
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
            )}
        </SafeAreaView>
    );
}

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
    },
    cardBody: { flex: 1, padding: 16 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    restaurantName: { fontSize: 16, fontWeight: '700', color: '#181C2E', flex: 1, marginRight: 8 },
    orderId: { fontSize: 12, color: '#A0A5BA', marginTop: 2 },
    orderDate: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
    scheduledTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
        gap: 6,
    },
    scheduledTimeText: { fontSize: 13, color: '#FF7A00', fontWeight: '600' },
    items: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12 },
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
    total: { fontSize: 18, fontWeight: '800', color: '#181C2E' },
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
    emptySubtitle: { fontSize: 13, color: '#A0A5BA', marginTop: 6, textAlign: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: { color: '#EF4444', flex: 1 },
    retryText: { color: '#FF7A00', fontWeight: '700', marginLeft: 8 },
});
