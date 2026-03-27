import { AdminHeader } from '@/components/admin/AdminHeader';
import { AddDishForm } from '@/components/admin/AddDishForm';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';
import { SkeletonLoader } from '@/components/admin/SkeletonLoader';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl, Platform } from 'react-native';
import { Modal, Portal, Button } from 'react-native-paper';

const C = AuthTheme.colors;

export default function DashboardScreen() {
    const router = useRouter();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isQRVisible, setIsQRVisible] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState('Restaurant');
    const [stats, setStats] = useState([
        { label: 'Total Orders', value: '0', icon: 'cart-outline', color: C.primary },
        { label: 'Pending', value: '0', icon: 'time-outline', color: '#FF9800' },
        { label: 'Active', value: '0', icon: 'flame-outline', color: '#9C27B0' },
        { label: 'Revenue', value: '₹0', icon: 'cash-outline', color: '#2196F3' },
    ]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orderFilter, setOrderFilter] = useState('ALL');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            const res = await fetch('/api/restaurants');
            if (res.ok) {
                const data = await res.json();
                if (data?.length > 0) {
                    const id = data[0].id;
                    setRestaurantId(id);
                    await Promise.all([fetchStats(id), fetchOrders(id)]);
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoadingData(false); }
    };

    const fetchStats = async (id: string) => {
        try {
            const res = await fetch(`/api/restaurants/${id}/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setRestaurantName(data.restaurantName);
            }
        } catch (e) { console.error(e); }
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
        if (restaurantId) await Promise.all([fetchStats(restaurantId), fetchOrders(restaurantId)]);
        setRefreshing(false);
    };

    const updateStatus = async (orderId: string, status: string) => {
        if (!restaurantId) return;
        try {
            await fetch(`/api/restaurants/${restaurantId}/orders`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status }),
            });
            await Promise.all([fetchStats(restaurantId), fetchOrders(restaurantId)]);
        } catch (e) { console.error(e); }
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

    const STATUS_FLOW: Record<string, string> = { PENDING: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY', READY: 'COMPLETED' };
    const STATUS_LABEL: Record<string, string> = { PENDING: 'Accept', CONFIRMED: 'Prepare', PREPARING: 'Ready', READY: 'Complete' };

    const filteredOrders = orderFilter === 'ALL' ? orders : orders.filter(o => {
        if (orderFilter === 'NEW') return o.status === 'PENDING';
        if (orderFilter === 'ACCEPTED') return ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status);
        return true;
    });

    const filterTabs = [
        { key: 'ALL', label: `All (${orders.length})` },
        { key: 'NEW', label: `New (${orders.filter(o => o.status === 'PENDING').length})` },
        { key: 'ACCEPTED', label: `Accepted (${orders.filter(o => ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status)).length})` },
    ];

    if (loadingData) {
        return (
            <View style={styles.container}>
                <AdminHeader restaurantName="Restaurant" />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <SkeletonLoader.Stats />
                    <View style={{ marginTop: 24 }}>
                        <SkeletonLoader.OrderCard />
                        <SkeletonLoader.OrderCard />
                    </View>
                </ScrollView>
            </View>
        );
    }

    const quickActions = [
        { icon: 'add-circle', label: 'Add Dish', bg: C.primary, onPress: () => restaurantId && setIsFormVisible(true) },
        { icon: 'person-circle', label: 'Profile', bg: C.darkNavy, onPress: () => router.push('/(admin)/profile') },
        { icon: 'qr-code', label: 'QR Code', bg: '#E65100', onPress: () => setIsQRVisible(true) },
        { icon: 'log-out', label: 'Logout', bg: '#455A64', onPress: () => router.replace('/login') },
    ];

    return (
        <View style={styles.container}>
            <AdminHeader restaurantName={restaurantName} />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
            >
                {/* Welcome */}
                <View style={styles.headerGutter}>
                    <Text style={styles.welcomeTitle}>Welcome back,</Text>
                    <Text style={styles.restaurantNameBig}>{restaurantName}</Text>
                    <Text style={styles.welcomeSub}>Dashboard Overview for Today</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, i) => {
                        const isRevenue = stat.label === 'Revenue';
                        return (
                            <View key={i} style={[styles.statCard, isRevenue && styles.statCardHighlight]}>
                                <View style={styles.statTop}>
                                    <Text style={[styles.statLabel, isRevenue && { color: C.white }]}>{stat.label}</Text>
                                    <View style={[styles.statIconWrap, isRevenue && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <Ionicons name={stat.icon as any} size={16} color={isRevenue ? C.white : stat.color} />
                                    </View>
                                </View>
                                <Text style={[styles.statValue, isRevenue && { color: C.white }]}>{stat.value}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    {quickActions.map((a, i) => (
                        <TouchableOpacity key={i} style={styles.actionCard} onPress={a.onPress} activeOpacity={0.7}>
                            <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                                <Ionicons name={a.icon as any} size={20} color={C.white} />
                            </View>
                            <Text style={styles.actionLabel}>{a.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Order Management */}
                <View style={styles.orderHeader}>
                    <Text style={styles.sectionTitle}>Order Management</Text>
                    <TouchableOpacity onPress={() => router.push('/(admin)/orders')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={styles.filterRow}>
                        {filterTabs.map(tab => {
                            const active = orderFilter === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[styles.filterChip, active && styles.filterChipActive]}
                                    onPress={() => setOrderFilter(tab.key)}
                                >
                                    <Text style={[styles.filterText, active && styles.filterTextActive]}>{tab.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Order Cards */}
                {filteredOrders.slice(0, 5).map((order) => {
                    const total = order.order_items?.reduce((s: number, it: any) => s + (it.dish?.price || 0) * (it.quantity || 1), 0) || 0;
                    const next = STATUS_FLOW[order.status];
                    return (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderCardTop}>
                                <View>
                                    <Text style={styles.orderIdLabel}>ORDER ID</Text>
                                    <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                                </View>
                                <Text style={styles.orderTime}>● {getTimeAgo(order.created_at)}</Text>
                            </View>
                            <View style={styles.orderCustomer}>
                                <View style={styles.customerAvatar}>
                                    <Ionicons name="person" size={16} color={C.textGrey} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.customerName}>{order.user?.full_name || 'Guest'}</Text>
                                    <Text style={styles.customerDining}>
                                        {order.dining_option === 'DINE_IN' ? 'DINE-IN' : 'TAKEAWAY'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.orderBottom}>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '18' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                                </View>
                                <Text style={styles.orderTotal}>₹{total.toFixed(2)}</Text>
                            </View>
                            {next && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: C.primary }]}
                                    onPress={() => updateStatus(order.id, next)}
                                >
                                    <Text style={styles.actionBtnText}>{STATUS_LABEL[order.status]}</Text>
                                </TouchableOpacity>
                            )}
                            {expandedOrderId === order.id && (
                                <View style={styles.itemsBox}>
                                    {order.order_items?.map((item: any, idx: number) => (
                                        <View key={idx} style={styles.itemRow}>
                                            <Ionicons name="restaurant-outline" size={14} color={C.primary} />
                                            <Text style={styles.itemName}>{item.dish?.name || 'Unknown'}</Text>
                                            <Text style={styles.itemQty}>x{item.quantity}</Text>
                                            <Text style={styles.itemPrice}>₹{((item.dish?.price || 0) * (item.quantity || 1)).toFixed(0)}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity style={styles.detailsLink} onPress={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                <Text style={styles.detailsText}>{expandedOrderId === order.id ? 'Hide Details  ‹' : 'Details  ›'}</Text>
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

            {/* Modals */}
            <Portal>
                <Modal visible={isFormVisible} onDismiss={() => setIsFormVisible(false)} contentContainerStyle={styles.modal}>
                    {restaurantId && (
                        <AddDishForm
                            restaurantId={restaurantId}
                            onSuccess={() => { setIsFormVisible(false); if (restaurantId) fetchStats(restaurantId); }}
                            onCancel={() => setIsFormVisible(false)}
                        />
                    )}
                </Modal>
                <Modal visible={isQRVisible} onDismiss={() => setIsQRVisible(false)} contentContainerStyle={styles.modal}>
                    <View style={styles.qrContent}>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setIsQRVisible(false)}>
                            <Ionicons name="close" size={24} color={C.darkNavy} />
                        </TouchableOpacity>
                        {restaurantId && <QRCodeGenerator restaurantId={restaurantId} />}
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.backgroundGrey },
    scrollContent: { padding: 20, paddingBottom: 40 },

    headerGutter: { marginBottom: 20 },
    welcomeTitle: { fontSize: 26, fontWeight: '800', color: C.darkNavy },
    restaurantNameBig: { fontSize: 28, fontWeight: '900', color: C.primary, marginTop: -4 },
    welcomeSub: { fontSize: 13, color: '#666', marginTop: 4, fontWeight: '500' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    statCard: {
        width: '48%', backgroundColor: C.white, padding: 16, borderRadius: 14, marginBottom: 12,
        borderWidth: 1, borderColor: '#F0F0F0',
    },
    statCardHighlight: { backgroundColor: C.primary, borderColor: C.primary },
    statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statLabel: { fontSize: 12, color: C.textGrey, fontWeight: '600' },
    statIconWrap: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: '800', color: C.darkNavy },

    sectionTitle: { fontSize: 17, fontWeight: '700', color: C.darkNavy, marginBottom: 14 },
    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    actionCard: {
        width: '48%', flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
        padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0', gap: 12,
    },
    actionIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    actionLabel: { fontSize: 14, fontWeight: '600', color: C.darkNavy },

    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    viewAll: { fontSize: 13, color: C.primary, fontWeight: '600' },
    filterRow: { flexDirection: 'row', gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E8E8E8' },
    filterChipActive: { backgroundColor: C.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
    filterTextActive: { color: C.white },

    orderCard: {
        backgroundColor: C.white, borderRadius: 14, padding: 16, marginBottom: 12,
        borderLeftWidth: 3, borderLeftColor: C.primary,
        ...Platform.select({
            web: { boxShadow: '0 1px 6px rgba(0,0,0,0.04)' },
            default: { elevation: 1 },
        }),
    },
    orderCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    orderIdLabel: { fontSize: 10, color: C.textGrey, fontWeight: '600', letterSpacing: 0.5 },
    orderId: { fontSize: 16, fontWeight: '700', color: C.darkNavy },
    orderTime: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
    orderCustomer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    customerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    customerName: { fontSize: 14, fontWeight: '600', color: C.darkNavy },
    customerDining: { fontSize: 11, color: C.textGrey, marginTop: 2 },
    orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '700' },
    orderTotal: { fontSize: 18, fontWeight: '800', color: C.darkNavy },
    actionBtn: { paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
    actionBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
    itemsBox: { backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    itemName: { flex: 1, fontSize: 13, fontWeight: '600', color: C.darkNavy },
    itemQty: { fontSize: 13, color: C.primary, fontWeight: '700' },
    itemPrice: { fontSize: 13, color: C.textGrey, fontWeight: '600', minWidth: 50, textAlign: 'right' as const },
    detailsLink: { alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    detailsText: { fontSize: 13, color: C.primary, fontWeight: '600' },

    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { marginTop: 10, color: C.textGrey, fontSize: 14 },
    modal: { margin: 20, backgroundColor: 'transparent' },
    modalClose: { position: 'absolute', top: 12, right: 12, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    qrContent: { paddingHorizontal: 20, paddingVertical: 24, paddingTop: 48, backgroundColor: C.white, borderRadius: 16 },
});
