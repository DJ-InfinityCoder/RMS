import { AddDishForm } from '@/components/admin/AddDishForm';
import { OrderTracker } from '@/components/admin/OrderTracker';
import { RestaurantProfile } from '@/components/admin/RestaurantProfile';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
    const router = useRouter();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState('Restaurant Admin');
    const [stats, setStats] = useState([
        { label: 'Total Orders', value: '0', icon: 'cart-outline', color: '#4CAF50' },
        { label: 'Pending', value: '0', icon: 'time-outline', color: '#FF9800' },
        { label: 'Completed', value: '0', icon: 'checkmark-circle-outline', color: '#2196F3' },
        { label: 'Revenue', value: '₹0', icon: 'cash-outline', color: '#9C27B0' },
    ]);
    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // In a real app, we'd get this from an auth context
            const response = await fetch('/api/restaurants');
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const id = data[0].id; // Use first one for demo if no session
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
            Alert.alert('Error', 'No restaurant found. Please check your account setup.');
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
                <ActivityIndicator size="large" color={AuthTheme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>{restaurantName}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => router.replace('/login')}
                >
                    <Ionicons name="log-out-outline" size={24} color={AuthTheme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
                                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleAddMenuPress}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="white" />
                            <Text style={styles.actionButtonText}>Add Menu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: '#666' }]}
                            onPress={() => setIsProfileVisible(true)}
                        >
                            <Ionicons name="business-outline" size={24} color="white" />
                            <Text style={styles.actionButtonText}>Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Tracker */}
                <View style={[styles.section, { flex: 1 }]}>
                    <Text style={styles.sectionTitle}>Order Tracker</Text>
                    {restaurantId ? (
                        <OrderTracker restaurantId={restaurantId} />
                    ) : (
                        <Text>Loading order tracker...</Text>
                    )}
                </View>
            </ScrollView>
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
                    {restaurantId && (
                        <RestaurantProfile 
                            restaurantId={restaurantId}
                        />
                    )}
                </Modal>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFF',
    },
    welcomeText: {
        fontSize: 14,
        color: '#666',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    activityIcon: {
        width: 35,
        height: 35,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    activityTime: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 15,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AuthTheme.colors.primary,
        paddingVertical: 15,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalContainer: {
        margin: 20,
        backgroundColor: 'transparent',
    },
});
