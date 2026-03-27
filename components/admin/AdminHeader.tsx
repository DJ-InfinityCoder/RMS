import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, ScrollView } from 'react-native';

const C = AuthTheme.colors;

interface AdminHeaderProps {
    restaurantName: string;
    title?: string;
    subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ restaurantName, title, subtitle }) => {
    const router = useRouter();
    const [hasNotif, setHasNotif] = useState(true);
    const [showNotifModal, setShowNotifModal] = useState(false);

    const dummyNotifs = [
        { id: '1', title: 'New Order!', text: 'Order #E873867C received', time: '2m ago', icon: 'receipt' },
        { id: '2', title: 'Order Ready', text: 'Order #669E68B0 is ready for pickup', time: '15m ago', icon: 'checkmark-circle' },
        { id: '3', title: 'Payment Received', text: '₹1250 received for Order #9901', time: '1h ago', icon: 'card' },
    ];

    const handleOpenNotifs = () => {
        setShowNotifModal(true);
        setHasNotif(false);
    };

    const handleViewAll = () => {
        setShowNotifModal(false);
        router.push('/(admin)/orders');
    };

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <View style={styles.brandRow}>
                    <TouchableOpacity style={styles.logo}>
                        <Ionicons name="restaurant" size={18} color={C.white} />
                    </TouchableOpacity>
                    <Text style={styles.brandName}>{restaurantName}</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={handleOpenNotifs}>
                    <Ionicons name="notifications-outline" size={20} color={C.white} />
                    {hasNotif && <View style={styles.notifDot} />}
                </TouchableOpacity>
            </View>

            <Modal
                visible={showNotifModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNotifModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.notifMenu}>
                        <View style={styles.notifHeader}>
                            <Text style={styles.notifTitle}>Notifications</Text>
                            <TouchableOpacity onPress={() => setShowNotifModal(false)}>
                                <Ionicons name="close" size={24} color={C.darkNavy} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.notifList}>
                            {dummyNotifs.map(n => (
                                <TouchableOpacity key={n.id} style={styles.notifItem} onPress={handleViewAll}>
                                    <View style={styles.notifIconBox}>
                                        <Ionicons name={n.icon as any} size={18} color={C.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.notifItemTitle}>{n.title}</Text>
                                        <Text style={styles.notifItemText}>{n.text}</Text>
                                        <Text style={styles.notifItemTime}>{n.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAll}>
                            <Text style={styles.viewAllText}>View All History</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {title && (
                <View style={styles.titleBlock}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: C.darkNavy,
        paddingTop: Platform.OS === 'web' ? 16 : 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 16,
        fontWeight: '700',
        color: C.primary,
    },
    notifBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: C.primary,
    },
    titleBlock: {
        marginTop: 18,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: C.white,
    },
    subtitle: {
        fontSize: 13,
        color: C.textGrey,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'web' ? 60 : 100,
        paddingHorizontal: 20,
    },
    notifMenu: {
        width: Platform.OS === 'web' ? 320 : '90%',
        backgroundColor: C.white,
        borderRadius: 16,
        padding: 16,
        ...Platform.select({
            web: { boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
            default: {
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
            },
        }),
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    notifTitle: { fontSize: 18, fontWeight: '800', color: C.darkNavy },
    notifList: { maxHeight: 300, marginTop: 10 },
    notifItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FAFAFA',
        gap: 12,
    },
    notifIconBox: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF5EF',
        justifyContent: 'center', alignItems: 'center',
    },
    notifItemTitle: { fontSize: 14, fontWeight: '700', color: C.darkNavy },
    notifItemText: { fontSize: 13, color: '#666', marginTop: 2 },
    notifItemTime: { fontSize: 11, color: C.textGrey, marginTop: 4 },
    viewAllBtn: {
        marginTop: 12,
        paddingVertical: 10,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    viewAllText: { fontSize: 14, fontWeight: '700', color: C.primary },
});
