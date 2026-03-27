import { AdminHeader } from '@/components/admin/AdminHeader';
import { AddOfferForm } from '@/components/admin/AddOfferForm';
import { SkeletonLoader } from '@/components/admin/SkeletonLoader';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Platform, Alert } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

const C = AuthTheme.colors;

interface Offer {
    id: string;
    title: string;
    discount_percent: number;
    valid_from: string | null;
    valid_to: string | null;
    is_active: boolean;
}

export default function OffersScreen() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);

    const fetchRestaurantAndOffers = async () => {
        try {
            const restRes = await fetch('/api/restaurants');
            const restaurants = await restRes.json();
            if (restaurants.length > 0) {
                const id = restaurants[0].id;
                setRestaurantId(id);
                fetchOffers(id);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchOffers = async (id: string) => {
        try {
            const response = await fetch(`/api/restaurants/${id}/offers`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setOffers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRestaurantAndOffers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        if (restaurantId) fetchOffers(restaurantId);
        else fetchRestaurantAndOffers();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <AdminHeader restaurantName="Spice Cave" />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {[1, 2, 3].map(i => <SkeletonLoader.OrderCard key={i} />)}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AdminHeader 
                restaurantName="Spice Cave" 
                title="Offers & Promotions" 
                subtitle="Manage your active discounts" 
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
            >
                <View style={styles.summaryRow}>
                    <View style={styles.summaryBox}>
                        <View style={styles.sumIcon}>
                            <Ionicons name="flash" size={16} color={C.white} />
                        </View>
                        <View>
                            <Text style={styles.summaryVal}>{offers.filter(o => o.is_active).length}</Text>
                            <Text style={styles.summaryLab}>Active Offers</Text>
                        </View>
                    </View>
                    <View style={[styles.summaryBox, { backgroundColor: C.white, borderWidth: 1, borderColor: '#EEE' }]}>
                        <View style={[styles.sumIcon, { backgroundColor: '#F0F0F0' }]}>
                            <Ionicons name="list" size={16} color={C.darkNavy} />
                        </View>
                        <View>
                            <Text style={[styles.summaryVal, { color: C.darkNavy }]}>{offers.length}</Text>
                            <Text style={[styles.summaryLab, { color: C.textGrey }]}>Total Promos</Text>
                        </View>
                    </View>
                </View>

                {offers.map((offer) => (
                    <View key={offer.id} style={styles.offerCard}>
                        <View style={styles.cardMain}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="pricetag" size={20} color={C.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.offerTitle}>{offer.title}</Text>
                                <View style={styles.discountRow}>
                                    <Text style={styles.offerDiscount}>{offer.discount_percent}% OFF</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: offer.is_active ? '#E8F5E9' : '#FFEBEE' }]}>
                                        <Text style={[styles.statusText, { color: offer.is_active ? '#2E7D32' : '#C62828' }]}>
                                            {offer.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        
                        {(offer.valid_from || offer.valid_to) && (
                            <View style={styles.cardFooter}>
                                <View style={styles.dateInfo}>
                                    <Ionicons name="calendar-outline" size={14} color={C.textGrey} />
                                    <Text style={styles.dateText}>
                                        {offer.valid_from ? new Date(offer.valid_from).toLocaleDateString() : 'Now'} 
                                        {' → '} 
                                        {offer.valid_to ? new Date(offer.valid_to).toLocaleDateString() : 'Permanent'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                ))}

                {offers.length === 0 && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="gift-outline" size={48} color={C.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>No Active Offers</Text>
                        <Text style={styles.emptyText}>Boost your sales by adding a special discount for your customers.</Text>
                        <TouchableOpacity 
                            style={styles.emptyBtn} 
                            onPress={() => setIsFormVisible(true)}
                        >
                            <Text style={styles.emptyBtnText}>Create Your First Offer</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsFormVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={C.white} />
            </TouchableOpacity>

            <Portal>
                <Modal visible={isFormVisible} onDismiss={() => setIsFormVisible(false)} contentContainerStyle={styles.modal}>
                    <AddOfferForm
                        restaurantId={restaurantId || ''}
                        onSuccess={() => { setIsFormVisible(false); if (restaurantId) fetchOffers(restaurantId); }}
                        onCancel={() => setIsFormVisible(false)}
                    />
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.backgroundGrey },
    scrollContent: { padding: 20, paddingBottom: 100 },
    
    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    summaryBox: { 
        flex: 1, backgroundColor: C.primary, padding: 18, borderRadius: 18, 
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderWidth: 1,
        borderColor: C.primary,
    },
    sumIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    summaryVal: { fontSize: 20, fontWeight: '900', color: C.white },
    summaryLab: { fontSize: 11, fontWeight: '600', color: C.white, opacity: 0.8 },

    offerCard: {
        backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF5EF', justifyContent: 'center', alignItems: 'center' },
    offerTitle: { fontSize: 16, fontWeight: '700', color: C.darkNavy },
    discountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
    offerDiscount: { fontSize: 15, fontWeight: '800', color: C.primary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
    statusText: { fontSize: 9, fontWeight: '800' },
    
    cardFooter: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 12, color: C.textGrey, fontWeight: '600' },

    fab: {
        position: 'absolute', bottom: 100, right: 20,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center',
        zIndex: 100,
        ...Platform.select({
            web: { position: 'fixed' as any, bottom: 110, right: 30, boxShadow: '0 8px 24px rgba(255,122,40,0.4)' },
            default: { elevation: 8 },
        }),
    },
    modal: { 
        margin: Platform.OS === 'web' ? 'auto' : 20, 
        width: Platform.OS === 'web' ? '85%' : undefined,
        maxWidth: 450,
        alignSelf: 'center',
        backgroundColor: 'transparent' 
    },
    emptyState: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
    emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF5EF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: C.darkNavy, marginBottom: 8 },
    emptyText: { textAlign: 'center', color: C.textGrey, fontSize: 14, lineHeight: 20, marginBottom: 24 },
    emptyBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
    emptyBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },
});
