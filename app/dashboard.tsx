import { AddDishForm } from '@/components/admin/AddDishForm';
import { RestaurantProfile } from '@/components/admin/RestaurantProfile';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Modal, Portal, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderTracker } from '@/components/admin/OrderTracker';

const C = AuthTheme.colors;

export default function DashboardScreen() {
    const router = useRouter();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [isQRVisible, setIsQRVisible] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState('Restaurant Admin');
    const [stats, setStats] = useState([
        { label: 'Total Orders', value: '0', icon: 'cart-outline', color: C.primary },
        { label: 'Pending', value: '0', icon: 'time-outline', color: '#FF9800' },
        { label: 'Active', value: '0', icon: 'flame-outline', color: '#9C27B0' },
        { label: 'Revenue', value: '₹0', icon: 'cash-outline', color: '#2196F3' },
    ]);
    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await fetch('/api/restaurants');
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const id = data[0].id;
                    setRestaurantId(id);
                    await fetchStats(id);
                }
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchStats = async (id: string) => {
        try {
            const response = await fetch(`/api/restaurants/${id}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
                setRestaurantName(data.restaurantName);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (restaurantId) {
            await fetchStats(restaurantId);
        }
        setRefreshing(false);
    };

    const handleAddMenuPress = () => {
        if (!restaurantId) {
            Alert.alert('Error', 'No restaurant found.');
            return;
        }
        setIsFormVisible(true);
    };

    const handleFormSuccess = () => {
        setIsFormVisible(false);
        if (restaurantId) fetchStats(restaurantId);
    };

    if (loadingData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={C.primary} />
            </View>
        );
    }

    const quickActions = [
        { icon: 'add-circle', label: 'Add Dish', bg: C.primary, onPress: handleAddMenuPress },
        { icon: 'restaurant', label: 'Profile', bg: C.darkNavy, onPress: () => setIsProfileVisible(true) },
        { icon: 'qr-code', label: 'QR Code', bg: '#E65100', onPress: () => setIsQRVisible(true) },
        { icon: 'log-out', label: 'Logout', bg: '#455A64', onPress: () => router.replace('/login') },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* ─── Premium Dark Header ─── */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {restaurantName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back 👋</Text>
                            <Text style={styles.userName}>{restaurantName}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notifButton}>
                        <Ionicons name="notifications-outline" size={22} color={C.white} />
                        <View style={styles.notifBadge} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
                }
            >
                {/* ─── Stats Cards ─── */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
                                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ─── Quick Actions ─── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={action.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIconCircle, { backgroundColor: action.bg }]}>
                                    <Ionicons name={action.icon as any} size={22} color={C.white} />
                                </View>
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ─── Order Management ─── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Order Management</Text>
                        <TouchableOpacity onPress={onRefresh}>
                            <Ionicons name="refresh-outline" size={20} color={C.textGrey} />
                        </TouchableOpacity>
                    </View>
                    {restaurantId ? (
                        <OrderTracker restaurantId={restaurantId} />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={C.textGrey} />
                            <Text style={styles.emptyText}>No restaurant linked</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ─── Modals ─── */}
            <Portal>
                <Modal
                    visible={isFormVisible}
                    onDismiss={() => setIsFormVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    {restaurantId && (
                        <AddDishForm
                            restaurantId={restaurantId}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsFormVisible(false)}
                        />
                    )}
                </Modal>

                <Modal
                    visible={isProfileVisible}
                    onDismiss={() => setIsProfileVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    {restaurantId && <RestaurantProfile restaurantId={restaurantId} />}
                </Modal>

                <Modal
                    visible={isQRVisible}
                    onDismiss={() => setIsQRVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <View style={styles.qrModalContent}>
                        {restaurantId && <QRCodeGenerator restaurantId={restaurantId} />}
                        <Button
                            mode="contained"
                            buttonColor={C.darkNavy}
                            textColor={C.white}
                            onPress={() => setIsQRVisible(false)}
                            style={{ marginTop: 16, borderRadius: 10 }}
                        >
                            Close
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.backgroundGrey,
    },

    // ─── Header ───
    header: {
        backgroundColor: C.darkNavy,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'web' ? 20 : 0,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...Platform.select({
            web: { boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
            },
        }),
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: C.white,
    },
    welcomeText: {
        fontSize: 13,
        color: C.textGrey,
        letterSpacing: 0.3,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: C.white,
        marginTop: 2,
    },
    notifButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.primary,
    },

    // ─── Content ───
    scrollContent: {
        padding: 20,
        paddingTop: 24,
    },

    // ─── Stats ───
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: C.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        ...Platform.select({
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
            },
        }),
    },
    statIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: C.darkNavy,
    },
    statLabel: {
        fontSize: 12,
        color: C.textGrey,
        marginTop: 3,
        fontWeight: '500',
        letterSpacing: 0.2,
    },

    // ─── Sections ───
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: C.darkNavy,
        letterSpacing: 0.3,
    },

    // ─── Quick Actions ───
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    actionCard: {
        width: '23%',
        alignItems: 'center',
        paddingVertical: 14,
        backgroundColor: C.white,
        borderRadius: 14,
        ...Platform.select({
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
            },
        }),
    },
    actionIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: C.darkNavy,
        textAlign: 'center',
    },

    // ─── Empty State ───
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 10,
        color: C.textGrey,
        fontSize: 14,
    },

    // ─── Modals ───
    modalContainer: {
        margin: 20,
        backgroundColor: 'transparent',
    },
    qrModalContent: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: C.white,
        borderRadius: 16,
    },
});
