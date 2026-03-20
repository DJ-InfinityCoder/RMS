import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── Mock User Data ───────────────────────────────────────────────────────────

const USER = {
    name: 'Bharat Sharma',
    email: 'bharat.sharma@email.com',
    phone: '+91 98765 43210',
    avatar: 'https://i.pravatar.cc/150?img=12',
    memberSince: 'January 2025',
    address: '12B, Sector 15, Noida, UP 201301',
    totalOrders: 24,
    totalSpent: '₹6,820',
    savedAddresses: 2,
    loyaltyPoints: 1240,
};

// ─── Section Row ─────────────────────────────────────────────────────────────

interface RowProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
    label: string;
    value?: string;
    onPress?: () => void;
    toggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (v: boolean) => void;
    danger?: boolean;
}

const ProfileRow: React.FC<RowProps> = ({
    icon, iconBg, iconColor, label, value, onPress,
    toggle, toggleValue, onToggle, danger,
}) => (
    <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={toggle ? 1 : 0.75}
        disabled={toggle && !onPress}
    >
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {toggle ? (
            <Switch
                value={toggleValue}
                onValueChange={onToggle}
                trackColor={{ false: '#D0D5DD', true: '#FF7A00' }}
                thumbColor="#FFF"
            />
        ) : (
            <View style={styles.rowRight}>
                {value && <Text style={styles.rowValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color="#A0A5BA" />
            </View>
        )}
    </TouchableOpacity>
);

// ─── Component ───────────────────────────────────────────────────────────────

export default function Profile() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [locationAccess, setLocationAccess] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: () => router.replace('/login' as any),
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity style={styles.settingsBtn}>
                        <Ionicons name="settings-outline" size={22} color="#181C2E" />
                    </TouchableOpacity>
                </View>

                {/* Avatar Card */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: USER.avatar }} style={styles.avatar} />
                        <TouchableOpacity style={styles.avatarEdit}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{USER.name}</Text>
                    <Text style={styles.userEmail}>{USER.email}</Text>
                    <Text style={styles.memberSince}>Member since {USER.memberSince}</Text>

                    {/* Loyalty Tag */}
                    <View style={styles.loyaltyBadge}>
                        <FontAwesome5 name="fire" size={12} color="#FF7A00" />
                        <Text style={styles.loyaltyText}>{USER.loyaltyPoints} Loyalty Points</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{USER.totalOrders}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{USER.totalSpent}</Text>
                        <Text style={styles.statLabel}>Total Spent</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{USER.savedAddresses}</Text>
                        <Text style={styles.statLabel}>Addresses</Text>
                    </View>
                </View>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.section}>
                    <ProfileRow
                        icon="person-outline"
                        iconBg="#EFF6FF"
                        iconColor="#3B82F6"
                        label="Personal Information"
                        value={USER.phone}
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="location-outline"
                        iconBg="#F0FDF4"
                        iconColor="#22C55E"
                        label="Saved Addresses"
                        value={USER.address.split(',')[0]}
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="card-outline"
                        iconBg="#FFF4E5"
                        iconColor="#FF7A00"
                        label="Payment Methods"
                        value="UPI, Card"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="gift-outline"
                        iconBg="#FEF2F2"
                        iconColor="#EF4444"
                        label="Loyalty & Rewards"
                        value={`${USER.loyaltyPoints} pts`}
                        onPress={() => { }}
                    />
                </View>

                {/* Food Preferences Section */}
                <Text style={styles.sectionTitle}>Food Preferences</Text>
                <View style={styles.section}>
                    <ProfileRow
                        icon="leaf-outline"
                        iconBg="#F0FDF4"
                        iconColor="#16A34A"
                        label="Dietary Preferences"
                        value="Veg"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="star-outline"
                        iconBg="#FFFBEB"
                        iconColor="#F59E0B"
                        label="Favourite Cuisines"
                        value="Indian, Chinese"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="flame-outline"
                        iconBg="#FEF2F2"
                        iconColor="#EF4444"
                        label="Spice Level"
                        value="Medium"
                        onPress={() => { }}
                    />
                </View>

                {/* App Settings Section */}
                <Text style={styles.sectionTitle}>App Settings</Text>
                <View style={styles.section}>
                    <ProfileRow
                        icon="notifications-outline"
                        iconBg="#EFF6FF"
                        iconColor="#3B82F6"
                        label="Push Notifications"
                        toggle
                        toggleValue={notifications}
                        onToggle={setNotifications}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="navigate-outline"
                        iconBg="#F0FDF4"
                        iconColor="#16A34A"
                        label="Location Access"
                        toggle
                        toggleValue={locationAccess}
                        onToggle={setLocationAccess}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="language-outline"
                        iconBg="#FFF4E5"
                        iconColor="#FF7A00"
                        label="Language"
                        value="English"
                        onPress={() => { }}
                    />
                </View>

                {/* Support Section */}
                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.section}>
                    <ProfileRow
                        icon="help-circle-outline"
                        iconBg="#EFF6FF"
                        iconColor="#3B82F6"
                        label="Help & FAQ"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="chatbubble-ellipses-outline"
                        iconBg="#F0FDF4"
                        iconColor="#16A34A"
                        label="Chat Support"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="document-text-outline"
                        iconBg="#F8F9FA"
                        iconColor="#6B7280"
                        label="Terms & Privacy Policy"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="star-outline"
                        iconBg="#FFFBEB"
                        iconColor="#F59E0B"
                        label="Rate the App"
                        onPress={() => { }}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>RMS App v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFF' },
    scroll: { paddingBottom: 100 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#181C2E' },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F5FA',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Avatar Card ──
    avatarCard: {
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
    },
    avatarWrapper: { position: 'relative', marginBottom: 14 },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#FF7A00',
    },
    avatarEdit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FF7A00',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    userName: { fontSize: 22, fontWeight: '700', color: '#181C2E' },
    userEmail: { fontSize: 13, color: '#A0A5BA', marginTop: 4, marginBottom: 6 },
    memberSince: { fontSize: 12, color: '#A0A5BA' },
    loyaltyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E5',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginTop: 12,
        gap: 6,
    },
    loyaltyText: { fontSize: 13, color: '#FF7A00', fontWeight: '700' },

    // ── Stats ──
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 24,
        borderRadius: 20,
        paddingVertical: 18,
        justifyContent: 'space-around',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
    },
    statBox: { alignItems: 'center', flex: 1 },
    statDivider: { width: 1, backgroundColor: '#F0F5FA' },
    statNumber: { fontSize: 20, fontWeight: '700', color: '#181C2E' },
    statLabel: { fontSize: 12, color: '#A0A5BA', marginTop: 4 },

    // ── Section ──
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#A0A5BA',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginHorizontal: 20,
        marginBottom: 8,
        marginTop: 20,
    },
    section: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    separator: { height: 1, backgroundColor: '#F0F5FA', marginLeft: 56 },

    // ── Row ──
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#181C2E' },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rowValue: { fontSize: 13, color: '#A0A5BA', maxWidth: 110 },

    // ── Logout ──
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 28,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#FEE2E2',
        backgroundColor: '#FEF2F2',
        gap: 8,
    },
    logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
    versionText: { textAlign: 'center', color: '#D0D5DD', fontSize: 12, marginTop: 20 },
});
