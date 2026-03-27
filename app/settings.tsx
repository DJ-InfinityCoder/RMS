import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/lib/UserContext';

// ─── Allergy Options ─────────────────────────────────────────────────────────

const ALL_ALLERGIES = ['Dairy', 'Nuts', 'Gluten', 'Eggs', 'Soy', 'Shellfish', 'Fish', 'Wheat'];
const DIETARY_OPTIONS = ['Any', 'Veg', 'Non-Veg', 'Vegan', 'Pescatarian'];
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];
const CUISINE_OPTIONS = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Japanese', 'Thai', 'American', 'Continental'];

export default function SettingsScreen() {
    const router = useRouter();
    const { preferences, paymentMethods, updatePreferences, addPaymentMethod, removePaymentMethod } = useUser();

    const [selectedAllergies, setSelectedAllergies] = useState<string[]>(preferences.allergies);
    const [selectedDietary, setSelectedDietary] = useState(preferences.dietary);
    const [selectedSpice, setSelectedSpice] = useState(preferences.spiceLevel);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>(preferences.favouriteCuisines);

    // ─── Toggle Allergy ──────────────────────────────────────────────────────
    const toggleAllergy = (allergy: string) => {
        setSelectedAllergies((prev) =>
            prev.includes(allergy)
                ? prev.filter((a) => a !== allergy)
                : [...prev, allergy]
        );
    };

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine)
                ? prev.filter((c) => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    // ─── Save ────────────────────────────────────────────────────────────────
    const handleSave = () => {
        updatePreferences({
            allergies: selectedAllergies,
            dietary: selectedDietary,
            spiceLevel: selectedSpice,
            favouriteCuisines: selectedCuisines,
        });
        Alert.alert('Saved!', 'Your preferences have been updated.');
        router.back();
    };

    const handleAddPayment = () => {
        Alert.alert(
            'Add Payment Method',
            'Choose payment type',
            [
                {
                    text: 'UPI',
                    onPress: () => {
                        addPaymentMethod({
                            id: `pm${Date.now()}`,
                            type: 'upi',
                            label: 'UPI - New Account',
                            isDefault: false,
                        });
                        Alert.alert('Added', 'UPI payment method added');
                    },
                },
                {
                    text: 'Card',
                    onPress: () => {
                        addPaymentMethod({
                            id: `pm${Date.now()}`,
                            type: 'card',
                            label: 'Card ****5678',
                            isDefault: false,
                        });
                        Alert.alert('Added', 'Card payment method added');
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Dietary Preferences ── */}
                <Text style={styles.sectionTitle}>Dietary Preference</Text>
                <View style={styles.section}>
                    <View style={styles.chipGrid}>
                        {DIETARY_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, selectedDietary === opt && styles.chipActive]}
                                onPress={() => setSelectedDietary(opt)}
                            >
                                <Text style={[styles.chipText, selectedDietary === opt && styles.chipTextActive]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Allergies ── */}
                <Text style={styles.sectionTitle}>
                    <Ionicons name="warning-outline" size={14} color="#EF4444" /> Allergies
                </Text>
                <Text style={styles.sectionSub}>
                    Items containing your allergens will be flagged in red
                </Text>
                <View style={styles.section}>
                    <View style={styles.chipGrid}>
                        {ALL_ALLERGIES.map((allergy) => (
                            <TouchableOpacity
                                key={allergy}
                                style={[
                                    styles.chip,
                                    selectedAllergies.includes(allergy) && styles.chipDanger,
                                ]}
                                onPress={() => toggleAllergy(allergy)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedAllergies.includes(allergy) && styles.chipTextDanger,
                                    ]}
                                >
                                    {selectedAllergies.includes(allergy) ? '⚠️ ' : ''}{allergy}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Spice Level ── */}
                <Text style={styles.sectionTitle}>Spice Level</Text>
                <View style={styles.section}>
                    <View style={styles.chipGrid}>
                        {SPICE_LEVELS.map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[styles.chip, selectedSpice === level && styles.chipActive]}
                                onPress={() => setSelectedSpice(level)}
                            >
                                <Text style={[styles.chipText, selectedSpice === level && styles.chipTextActive]}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Favourite Cuisines ── */}
                <Text style={styles.sectionTitle}>Favourite Cuisines</Text>
                <View style={styles.section}>
                    <View style={styles.chipGrid}>
                        {CUISINE_OPTIONS.map((cuisine) => (
                            <TouchableOpacity
                                key={cuisine}
                                style={[
                                    styles.chip,
                                    selectedCuisines.includes(cuisine) && styles.chipActive,
                                ]}
                                onPress={() => toggleCuisine(cuisine)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedCuisines.includes(cuisine) && styles.chipTextActive,
                                    ]}
                                >
                                    {cuisine}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Payment Methods ── */}
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                <View style={styles.section}>
                    {paymentMethods.map((pm) => (
                        <View key={pm.id} style={styles.paymentRow}>
                            <View style={styles.paymentIconWrap}>
                                <Ionicons
                                    name={pm.type === 'upi' ? 'phone-portrait-outline' : 'card-outline'}
                                    size={18}
                                    color="#FF7A00"
                                />
                            </View>
                            <Text style={styles.paymentLabel}>{pm.label}</Text>
                            {pm.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert('Remove', `Remove ${pm.label}?`, [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Remove',
                                            style: 'destructive',
                                            onPress: () => removePaymentMethod(pm.id),
                                        },
                                    ]);
                                }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addPaymentBtn} onPress={handleAddPayment}>
                        <Ionicons name="add-circle-outline" size={18} color="#FF7A00" />
                        <Text style={styles.addPaymentText}>Add Payment Method</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Save Button ── */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                    <Text style={styles.saveBtnText}>Save Preferences</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F5FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E' },
    scroll: { paddingBottom: 100 },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#181C2E',
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 6,
    },
    sectionSub: {
        fontSize: 12,
        color: '#A0A5BA',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    section: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 18,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F5FA',
        borderWidth: 1,
        borderColor: '#F0F5FA',
    },
    chipActive: {
        backgroundColor: '#FF7A00',
        borderColor: '#FF7A00',
    },
    chipDanger: {
        backgroundColor: '#FEF2F2',
        borderColor: '#EF4444',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    chipTextActive: {
        color: '#FFF',
    },
    chipTextDanger: {
        color: '#EF4444',
        fontWeight: '700',
    },

    // Payment
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F5FA',
    },
    paymentIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF4E5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    paymentLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#181C2E' },
    defaultBadge: {
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 8,
    },
    defaultText: { fontSize: 11, color: '#22C55E', fontWeight: '700' },
    addPaymentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    addPaymentText: { fontSize: 14, fontWeight: '600', color: '#FF7A00' },

    // Save
    saveBtn: {
        backgroundColor: '#FF7A00',
        marginHorizontal: 20,
        marginTop: 30,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#FF7A00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
