import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Card, Paragraph, Chip, Button } from 'react-native-paper';

interface OrderItem {
    dish: { name: string; price: number };
    quantity: number;
}

interface Order {
    id: string;
    status: string;
    dining_option: string;
    created_at: string;
    user: { full_name: string; phone: string } | null;
    order_items: OrderItem[];
}

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

const STATUS_FLOW: Record<string, string> = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'COMPLETED',
};

const STATUS_ACTION_LABEL: Record<string, string> = {
    PENDING: 'Accept Order',
    CONFIRMED: 'Start Preparing',
    PREPARING: 'Mark Ready',
    READY: 'Complete Order',
};

const STATUS_ACTION_ICON: Record<string, string> = {
    PENDING: 'checkmark-circle',
    CONFIRMED: 'flame',
    PREPARING: 'checkmark-done',
    READY: 'bag-check',
};

const STATUS_COLOR: Record<string, string> = {
    PENDING: '#FF7A28',
    CONFIRMED: '#181924',
    PREPARING: '#FF7A28',
    READY: '#181924',
    COMPLETED: '#181924',
    CANCELLED: '#9E9E9E',
};

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'New' },
    { key: 'CONFIRMED', label: 'Accepted' },
    { key: 'PREPARING', label: 'Cooking' },
    { key: 'READY', label: 'Ready' },
    { key: 'COMPLETED', label: 'Done' },
];

export const OrderTracker = ({ restaurantId }: { restaurantId: string }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('ALL');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/orders`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, [restaurantId]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/restaurants/${restaurantId}/orders`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            } else {
                Alert.alert('Error', 'Failed to update order status.');
            }
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Network error while updating.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAdvance = (order: Order) => {
        const nextStatus = STATUS_FLOW[order.status];
        if (!nextStatus) return;
        updateStatus(order.id, nextStatus);
    };

    const handleCancel = (order: Order) => {
        Alert.alert(
            'Cancel Order',
            `Are you sure you want to cancel Order #${order.id.slice(0, 8)}?`,
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: () => updateStatus(order.id, 'CANCELLED') },
            ]
        );
    };

    const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const getOrderTotal = (items: OrderItem[]) => {
        return items.reduce((sum, item) => sum + (item.dish?.price || 0) * (item.quantity || 1), 0);
    };

    const renderOrder = ({ item }: { item: Order }) => {
        const nextStatus = STATUS_FLOW[item.status];
        const isUpdating = updatingId === item.id;
        const statusColor = STATUS_COLOR[item.status] || '#9E9E9E';
        const total = getOrderTotal(item.order_items);
        const canCancel = ['PENDING', 'CONFIRMED'].includes(item.status);

        return (
            <Card style={styles.orderCard}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.orderHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
                            <Text style={styles.timeText}>{getTimeAgo(item.created_at)}</Text>
                        </View>
                        <Chip
                            textStyle={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}
                            style={[styles.statusChip, { backgroundColor: statusColor }]}
                        >
                            {item.status}
                        </Chip>
                    </View>

                    {/* Customer */}
                    <View style={styles.customerRow}>
                        <Ionicons name="person-outline" size={14} color="#888" />
                        <Text style={styles.customerText}>{item.user?.full_name || 'Guest'}</Text>
                        {item.dining_option && (
                            <Chip textStyle={{ fontSize: 10 }} style={styles.diningChip}>
                                {item.dining_option === 'DINE_IN' ? '🍽 Dine-in' : '📦 Pickup'}
                            </Chip>
                        )}
                    </View>

                    {/* Items */}
                    <View style={styles.divider} />
                    {item.order_items.map((oi, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <Text style={styles.itemText}>
                                {oi.dish?.name || 'Unknown'} × {oi.quantity}
                            </Text>
                            <Text style={styles.itemPrice}>
                                ₹{((oi.dish?.price || 0) * (oi.quantity || 1)).toFixed(0)}
                            </Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.itemRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
                    </View>
                </Card.Content>

                {/* Actions */}
                {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                    <Card.Actions style={styles.actions}>
                        {canCancel && (
                            <Button
                                mode="outlined"
                                textColor="#F44336"
                                style={styles.cancelBtn}
                                onPress={() => handleCancel(item)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                        )}
                        {nextStatus && (
                            <Button
                                mode="contained"
                                buttonColor={STATUS_COLOR[nextStatus] || '#4CAF50'}
                                icon={STATUS_ACTION_ICON[item.status]}
                                onPress={() => handleAdvance(item)}
                                loading={isUpdating}
                                disabled={isUpdating}
                                style={styles.advanceBtn}
                            >
                                {STATUS_ACTION_LABEL[item.status]}
                            </Button>
                        )}
                    </Card.Actions>
                )}
            </Card>
        );
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 20 }} color={AuthTheme.colors.primary} />;

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <FlatList
                horizontal
                data={FILTER_TABS}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: tab }) => {
                    const isActive = filter === tab.key;
                    const count = tab.key === 'ALL'
                        ? orders.length
                        : orders.filter(o => o.status === tab.key).length;
                    return (
                        <TouchableOpacity
                            style={[styles.filterTab, isActive && styles.filterTabActive]}
                            onPress={() => setFilter(tab.key)}
                        >
                            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                {tab.label} ({count})
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Orders List */}
            <FlatList
                data={filteredOrders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {filter === 'ALL' ? 'No orders yet.' : `No ${filter.toLowerCase()} orders.`}
                    </Text>
                }
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterRow: {
        paddingBottom: 12,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
    },
    filterTabActive: {
        backgroundColor: AuthTheme.colors.primary,
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFF',
    },
    listContent: {
        paddingBottom: 20,
    },
    orderCard: {
        marginBottom: 12,
        backgroundColor: '#FFF',
        elevation: 2,
        borderRadius: 12,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181924',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    statusChip: {
        height: 28,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    customerText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    diningChip: {
        height: 24,
        backgroundColor: '#F5F5F5',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemText: {
        fontSize: 14,
        color: '#181924',
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#181924',
    },
    totalValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FF7A28',
    },
    actions: {
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        paddingBottom: 12,
        gap: 8,
    },
    cancelBtn: {
        borderColor: '#F44336',
    },
    advanceBtn: {
        borderRadius: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 15,
    },
});
