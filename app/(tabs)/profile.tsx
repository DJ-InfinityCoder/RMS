import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/lib/UserContext';

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
                {value && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color="#A0A5BA" />
            </View>
        )}
    </TouchableOpacity>
);

// ─── Component ───────────────────────────────────────────────────────────────

export default function Profile() {
    const router = useRouter();
    const { profile, preferences, loyalty, paymentMethods, updateProfile, canPayCash } = useUser();
    const [notifications, setNotifications] = useState(true);
    const [locationAccess, setLocationAccess] = useState(true);

    // ── Edit Profile Modal ──
    const [editVisible, setEditVisible] = useState(false);
    const [editName, setEditName] = useState(profile.name);
    const [editEmail, setEditEmail] = useState(profile.email);
    const [editPhone, setEditPhone] = useState(profile.phone);
    const [editAddress, setEditAddress] = useState(profile.address);

    const handleSaveProfile = () => {
        updateProfile({
            name: editName,
            email: editEmail,
            phone: editPhone,
            address: editAddress,
        });
        setEditVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
    };

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

    const paymentMethodStr = paymentMethods.map((p) => p.label.split(' ')[0]).join(', ');

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push('/settings' as any)}
                    >
                        <Ionicons name="settings-outline" size={22} color="#181C2E" />
                    </TouchableOpacity>
                </View>

                {/* Avatar Card */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                        <TouchableOpacity style={styles.avatarEdit}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{profile.name}</Text>
                    <Text style={styles.userEmail}>{profile.email}</Text>
                    <Text style={styles.memberSince}>Member since {profile.memberSince}</Text>

                    {/* Edit Profile Button */}
                    <TouchableOpacity
                        style={styles.editProfileBtn}
                        onPress={() => {
                            setEditName(profile.name);
                            setEditEmail(profile.email);
                            setEditPhone(profile.phone);
                            setEditAddress(profile.address);
                            setEditVisible(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create-outline" size={16} color="#FFF" />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>

                    {/* Loyalty Tag */}
                    <View style={styles.loyaltyBadge}>
                        <FontAwesome5 name="fire" size={12} color="#FF7A00" />
                        <Text style={styles.loyaltyText}>{loyalty.points} Loyalty Points</Text>
                    </View>

                    {/* Payment Status */}
                    <View style={[styles.paymentStatusBadge, !canPayCash() && styles.paymentWarning]}>
                        <Ionicons
                            name={canPayCash() ? 'checkmark-circle' : 'alert-circle'}
                            size={14}
                            color={canPayCash() ? '#22C55E' : '#EF4444'}
                        />
                        <Text style={[styles.paymentStatusText, !canPayCash() && { color: '#EF4444' }]}>
                            {canPayCash()
                                ? 'Cash & Online payments available'
                                : 'Online payment only (low loyalty pts)'}
                        </Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>₹6,820</Text>
                        <Text style={styles.statLabel}>Total Spent</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{loyalty.points}</Text>
                        <Text style={styles.statLabel}>Points</Text>
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
                        value={profile.phone}
                        onPress={() => setEditVisible(true)}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="location-outline"
                        iconBg="#F0FDF4"
                        iconColor="#22C55E"
                        label="Saved Addresses"
                        value={profile.address.split(',')[0]}
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="card-outline"
                        iconBg="#FFF4E5"
                        iconColor="#FF7A00"
                        label="Payment Methods"
                        value={paymentMethodStr}
                        onPress={() => router.push('/settings' as any)}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="gift-outline"
                        iconBg="#FEF2F2"
                        iconColor="#EF4444"
                        label="Loyalty & Rewards"
                        value={`${loyalty.points} pts`}
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
                        value={preferences.dietary}
                        onPress={() => router.push('/settings' as any)}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="warning-outline"
                        iconBg="#FEF2F2"
                        iconColor="#EF4444"
                        label="Allergies"
                        value={preferences.allergies.length > 0 ? preferences.allergies.join(', ') : 'None set'}
                        onPress={() => router.push('/settings' as any)}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="star-outline"
                        iconBg="#FFFBEB"
                        iconColor="#F59E0B"
                        label="Favourite Cuisines"
                        value={preferences.favouriteCuisines.join(', ')}
                        onPress={() => router.push('/settings' as any)}
                    />
                    <View style={styles.separator} />
                    <ProfileRow
                        icon="flame-outline"
                        iconBg="#FEF2F2"
                        iconColor="#EF4444"
                        label="Spice Level"
                        value={preferences.spiceLevel}
                        onPress={() => router.push('/settings' as any)}
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

            {/* ── Edit Profile Modal ── */}
            <Modal
                animationType="slide"
                transparent
                visible={editVisible}
                onRequestClose={() => setEditVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Your name"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={editEmail}
                            onChangeText={setEditEmail}
                            placeholder="Email address"
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={editPhone}
                            onChangeText={setEditPhone}
                            placeholder="Phone number"
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            value={editAddress}
                            onChangeText={setEditAddress}
                            placeholder="Your address"
                            multiline
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7A00',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 14,
        gap: 6,
    },
    editProfileText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
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
    paymentStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginTop: 8,
        gap: 6,
    },
    paymentWarning: {
        backgroundColor: '#FEF2F2',
    },
    paymentStatusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#22C55E',
    },

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

    // ── Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#181C2E',
    },
    label: {
        fontSize: 13,
        color: '#A0A5BA',
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#F0F5FA',
        padding: 14,
        borderRadius: 12,
        marginBottom: 14,
        fontSize: 15,
        color: '#181C2E',
    },
    saveBtn: {
        backgroundColor: '#FF7A00',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    cancelBtn: { padding: 14, alignItems: 'center' },
    cancelBtnText: { color: '#A0A5BA', fontWeight: '600' },
});
