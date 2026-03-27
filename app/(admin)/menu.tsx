import { AdminHeader } from '@/components/admin/AdminHeader';
import { AddDishForm } from '@/components/admin/AddDishForm';
import { SkeletonLoader } from '@/components/admin/SkeletonLoader';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Image, Platform } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

const C = AuthTheme.colors;

interface Dish {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    calories: number;
    image_url: string;
    is_available: boolean;
}

export default function MenuScreen() {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState('Restaurant');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isFormVisible, setIsFormVisible] = useState(false);

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
                    await fetchDishes(id);
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchDishes = async (id: string) => {
        try {
            const res = await fetch(`/api/restaurants/${id}/dishes`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setDishes(data);
            }
        } catch (e) { console.error(e); }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (restaurantId) await fetchDishes(restaurantId);
        setRefreshing(false);
    };

    const categories = ['All', ...new Set(dishes.map(d => d.category || 'Other').filter(Boolean))];
    const filtered = selectedCategory === 'All' ? dishes : dishes.filter(d => d.category === selectedCategory);

    if (loading) {
        return (
            <View style={styles.container}>
                <AdminHeader restaurantName="Restaurant" />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {[1, 2, 3, 4, 5].map(i => <SkeletonLoader.MenuItem key={i} />)}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AdminHeader
                restaurantName={restaurantName}
                title="Menu Management"
                subtitle={`${dishes.length} items in your menu`}
            />

            {/* Category Tabs */}
            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                    {categories.map(cat => {
                        const active = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.catChip, active && styles.catChipActive]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
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
                {filtered.map(dish => (
                    <View key={dish.id} style={styles.dishCard}>
                        <View style={styles.dishRow}>
                            {dish.image_url ? (
                                <Image source={{ uri: dish.image_url }} style={styles.dishImage} />
                            ) : (
                                <View style={[styles.dishImage, styles.dishImagePlaceholder]}>
                                    <Ionicons name="fast-food-outline" size={24} color={C.textGrey} />
                                </View>
                            )}
                            <View style={styles.dishInfo}>
                                <Text style={styles.dishName}>{dish.name}</Text>
                                <Text style={styles.dishDesc} numberOfLines={2}>{dish.description}</Text>
                                <View style={styles.dishMeta}>
                                    <Text style={styles.dishPrice}>₹{dish.price}</Text>
                                    {dish.calories > 0 && (
                                        <Text style={styles.dishCal}>🔥 {dish.calories} cal</Text>
                                    )}
                                </View>
                                {dish.category && (
                                    <View style={styles.catBadge}>
                                        <Text style={styles.catBadgeText}>{dish.category}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                ))}

                {filtered.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="fast-food-outline" size={48} color={C.textGrey} />
                        <Text style={styles.emptyText}>No dishes in this category</Text>
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => restaurantId && setIsFormVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={C.white} />
            </TouchableOpacity>

            <Portal>
                <Modal visible={isFormVisible} onDismiss={() => setIsFormVisible(false)} contentContainerStyle={styles.modal}>
                    {restaurantId && (
                        <AddDishForm
                            restaurantId={restaurantId}
                            onSuccess={() => { setIsFormVisible(false); if (restaurantId) fetchDishes(restaurantId); }}
                            onCancel={() => setIsFormVisible(false)}
                        />
                    )}
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.backgroundGrey },
    scrollContent: { padding: 20, paddingBottom: 120 },

    categoryContainer: { height: 60, backgroundColor: C.backgroundGrey },
    categoryRow: { paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center', gap: 10 },
    catChip: { 
        paddingHorizontal: 20, 
        height: 38, // Fixed height to prevent stretching
        borderRadius: 19, 
        backgroundColor: '#EAEAEA', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    catChipActive: { backgroundColor: C.primary },
    catText: { fontSize: 13, fontWeight: '600', color: '#666' },
    catTextActive: { color: C.white },

    dishCard: {
        backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 12,
        ...Platform.select({
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
            default: { elevation: 2 },
        }),
    },
    dishRow: { flexDirection: 'row', gap: 14 },
    dishImage: { width: 80, height: 80, borderRadius: 12 },
    dishImagePlaceholder: { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    dishInfo: { flex: 1 },
    dishName: { fontSize: 16, fontWeight: '700', color: C.darkNavy, marginBottom: 4 },
    dishDesc: { fontSize: 12, color: C.textGrey, marginBottom: 8, lineHeight: 17 },
    dishMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dishPrice: { fontSize: 16, fontWeight: '800', color: C.primary },
    dishCal: { fontSize: 12, color: C.textGrey },
    catBadge: { marginTop: 6, backgroundColor: C.darkNavy + '10', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
    catBadgeText: { fontSize: 10, fontWeight: '600', color: C.darkNavy },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 10, color: C.textGrey, fontSize: 14 },

    fab: {
        position: 'absolute', bottom: 120, right: 20,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center',
        zIndex: 100,
        ...Platform.select({
            web: { position: 'fixed' as any, bottom: 110, right: 30, boxShadow: '0 6px 20px rgba(255,122,40,0.4)' },
            default: { elevation: 8 },
        }),
    },
    modal: { margin: 20, backgroundColor: 'transparent' },
});
