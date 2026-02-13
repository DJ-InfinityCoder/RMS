import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
    const router = useRouter();

    const stats = [
        { label: 'Total Orders', value: '128', icon: 'cart-outline', color: '#4CAF50' },
        { label: 'Pending', value: '12', icon: 'time-outline', color: '#FF9800' },
        { label: 'Completed', value: '116', icon: 'checkmark-circle-outline', color: '#2196F3' },
        { label: 'Revenue', value: '$1,250', icon: 'cash-outline', color: '#9C27B0' },
    ];

    const recentActivities = [
        { id: '1', title: 'New order placed', time: '2 mins ago', icon: 'notifications-outline' },
        { id: '2', title: 'Payment received', time: '15 mins ago', icon: 'card-outline' },
        { id: '3', title: 'Order delivered', time: '1 hour ago', icon: 'bicycle-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>Restaurant Admin</Text>
                </View>
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => router.replace('/login')}
                >
                    <Ionicons name="log-out-outline" size={24} color={AuthTheme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {recentActivities.map((activity) => (
                        <View key={activity.id} style={styles.activityItem}>
                            <View style={styles.activityIcon}>
                                <Ionicons name={activity.icon as any} size={20} color="#666" />
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="add-circle-outline" size={24} color="white" />
                            <Text style={styles.actionButtonText}>Add Menu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#666' }]}>
                            <Ionicons name="settings-outline" size={24} color="white" />
                            <Text style={styles.actionButtonText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
});
