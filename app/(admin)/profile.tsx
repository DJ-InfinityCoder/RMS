import { AdminHeader } from '@/components/admin/AdminHeader';
import { SkeletonLoader } from '@/components/admin/SkeletonLoader';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

const C = AuthTheme.colors;

interface Restaurant {
    id: string;
    name: string;
    email: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    cuisine: string[];
    is_active: boolean;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ dishes: 0, orders: 0, reviews: 0 });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/restaurants');
            if (res.ok) {
                const data = await res.json();
                if (data?.length > 0) {
                    setRestaurant(data[0]);
                    // Fetch counts
                    const [dishRes, orderRes] = await Promise.all([
                        fetch(`/api/restaurants/${data[0].id}/dishes`),
                        fetch(`/api/restaurants/${data[0].id}/orders`),
                    ]);
                    const dishes = dishRes.ok ? await dishRes.json() : [];
                    const orders = orderRes.ok ? await orderRes.json() : [];
                    setStats({
                        dishes: Array.isArray(dishes) ? dishes.length : 0,
                        orders: Array.isArray(orders) ? orders.length : 0,
                        reviews: 0,
                    });
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <AdminHeader restaurantName="Restaurant" />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <SkeletonLoader.Profile />
                </ScrollView>
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: C.textGrey }}>No restaurant found</Text>
            </View>
        );
    }

    const profileItems = [
        { icon: 'mail-outline', label: 'Email', value: restaurant.email },
        { icon: 'call-outline', label: 'Phone', value: restaurant.phone || 'Not set' },
        { icon: 'location-outline', label: 'Address', value: restaurant.address },
        { icon: 'business-outline', label: 'City', value: restaurant.city || 'Not set' },
        { icon: 'restaurant-outline', label: 'Cuisine', value: restaurant.cuisine?.join(', ') || 'Not set' },
    ];

    const statCards = [
        { icon: 'fast-food', value: stats.dishes, label: 'Dishes', color: C.primary },
        { icon: 'receipt', value: stats.orders, label: 'Orders', color: C.darkNavy },
        { icon: 'star', value: stats.reviews, label: 'Reviews', color: C.primary },
    ];

    return (
        <View style={styles.container}>
            <AdminHeader restaurantName={restaurant.name} title="Profile" subtitle="Manage your restaurant profile" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Avatar & Name */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="restaurant" size={32} color={C.white} />
                    </View>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    {restaurant.description && <Text style={styles.description}>{restaurant.description}</Text>}
                    <View style={styles.activeBadge}>
                        <View style={[styles.dot, { backgroundColor: restaurant.is_active ? '#4CAF50' : '#F44336' }]} />
                        <Text style={styles.activeText}>{restaurant.is_active ? 'Active' : 'Inactive'}</Text>
                    </View>
                </View>

                {/* Stat Cards */}
                <View style={styles.statRow}>
                    {statCards.map((s, i) => (
                        <View key={i} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                                <Ionicons name={s.icon as any} size={20} color={s.color} />
                            </View>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Profile Info */}
                <Text style={styles.sectionTitle}>Restaurant Details</Text>
                <View style={styles.infoCard}>
                    {profileItems.map((item, i) => (
                        <View key={i} style={[styles.infoRow, i < profileItems.length - 1 && styles.infoBorder]}>
                            <Ionicons name={item.icon as any} size={18} color={C.primary} />
                            <View style={styles.infoTextBlock}>
                                <Text style={styles.infoLabel}>{item.label}</Text>
                                <Text style={styles.infoValue}>{item.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/login')}>
                    <Ionicons name="log-out-outline" size={20} color="#F44336" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.backgroundGrey },
    scrollContent: { padding: 20, paddingBottom: 40 },

    avatarSection: { alignItems: 'center', marginBottom: 24 },
    avatar: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    restaurantName: { fontSize: 22, fontWeight: '800', color: C.darkNavy, marginBottom: 4 },
    description: { fontSize: 13, color: C.textGrey, textAlign: 'center', paddingHorizontal: 20, marginBottom: 8 },
    activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    activeText: { fontSize: 12, fontWeight: '600', color: C.darkNavy },

    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statCard: {
        flex: 1, backgroundColor: C.white, borderRadius: 14, padding: 16, alignItems: 'center',
        marginHorizontal: 4,
        ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }, default: { elevation: 2 } }),
    },
    statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: '800', color: C.darkNavy },
    statLabel: { fontSize: 11, color: C.textGrey, marginTop: 2, fontWeight: '600' },

    sectionTitle: { fontSize: 17, fontWeight: '700', color: C.darkNavy, marginBottom: 14 },
    infoCard: {
        backgroundColor: C.white, borderRadius: 14, padding: 4, marginBottom: 24,
        ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }, default: { elevation: 2 } }),
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    infoBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    infoTextBlock: { flex: 1 },
    infoLabel: { fontSize: 11, color: C.textGrey, fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: '600', color: C.darkNavy },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: C.white, paddingVertical: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#F44336',
    },
    logoutText: { fontSize: 15, fontWeight: '600', color: '#F44336' },
});
