import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/lib/UserContext';
import Toast from '@/components/Toast';

const DIETARY_OPTIONS = ['Veg', 'Non-Veg', 'Vegan', 'Any'];
const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy'];
const CUISINE_OPTIONS = ['Indian', 'Chinese', 'Italian', 'American', 'Mexican', 'Japanese', 'Thai', 'Continental'];
const COMMON_ALLERGENS = ['Dairy', 'Nuts', 'Gluten', 'Eggs', 'Soy', 'Shellfish', 'Fish', 'Sesame'];

export default function EditProfileScreen() {
    const router = useRouter();
    const { profile, preferences, updateProfile, updatePreferences, addAllergy, removeAllergy, loading } = useUser();

    const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
    const [saving, setSaving] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        visible: false,
        message: '',
        type: 'success',
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ visible: true, message, type });
    };

    // Profile state
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [phone, setPhone] = useState(profile.phone);
    const [address, setAddress] = useState(profile.address);

    // Preferences state
    const [dietary, setDietary] = useState(preferences.dietary);
    const [spiceLevel, setSpiceLevel] = useState(preferences.spiceLevel);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>(preferences.favouriteCuisines);
    const [allergies, setAllergies] = useState<string[]>(preferences.allergies);
    const [newAllergy, setNewAllergy] = useState('');

    // Sync local state when context data loads/changes
    React.useEffect(() => {
        if (profile.name !== 'Guest') setName(profile.name);
        if (profile.email) setEmail(profile.email);
        if (profile.phone) setPhone(profile.phone);
        if (profile.address) setAddress(profile.address);
    }, [profile]);

    React.useEffect(() => {
        setDietary(preferences.dietary);
        setSpiceLevel(preferences.spiceLevel);
        setSelectedCuisines(preferences.favouriteCuisines);
        setAllergies(preferences.allergies);
    }, [preferences]);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setSaving(true);
        try {
            await updateProfile({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
            });
            showToast('Profile updated successfully!', 'success');
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            await updatePreferences({
                dietary,
                spiceLevel,
                favouriteCuisines: selectedCuisines,
                allergies,
            });
            showToast('Preferences updated successfully!', 'success');
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            showToast(error.message || 'Failed to update preferences', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine)
                ? prev.filter((c) => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    const toggleAllergy = async (allergen: string) => {
        if (allergies.includes(allergen)) {
            const newAllergies = allergies.filter((a) => a !== allergen);
            setAllergies(newAllergies);
        } else {
            setAllergies([...allergies, allergen]);
        }
    };

    const handleAddCustomAllergy = async () => {
        if (!newAllergy.trim()) return;
        
        const trimmed = newAllergy.trim();
        if (!allergies.includes(trimmed)) {
            setAllergies([...allergies, trimmed]);
        }
        setNewAllergy('');
    };

    const handleRemoveAllergy = (allergen: string) => {
        setAllergies(allergies.filter((a) => a !== allergen));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
                        onPress={() => setActiveTab('profile')}
                    >
                        <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                            Profile
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'preferences' && styles.tabActive]}
                        onPress={() => setActiveTab('preferences')}
                    >
                        <Text style={[styles.tabText, activeTab === 'preferences' && styles.tabTextActive]}>
                            Preferences
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {activeTab === 'profile' ? (
                        // Profile Tab
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Personal Information</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#9E9E9E"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9E9E9E"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="#9E9E9E"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Enter your address"
                                    placeholderTextColor="#9E9E9E"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                                onPress={handleSaveProfile}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Preferences Tab
                        <View style={styles.section}>
                            {/* Dietary Preference */}
                            <View style={styles.preferenceSection}>
                                <Text style={styles.sectionTitle}>Dietary Preference</Text>
                                <View style={styles.optionsRow}>
                                    {DIETARY_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.optionButton,
                                                dietary === option && styles.optionButtonActive,
                                            ]}
                                            onPress={() => setDietary(option)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    dietary === option && styles.optionTextActive,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Spice Level */}
                            <View style={styles.preferenceSection}>
                                <Text style={styles.sectionTitle}>Spice Level</Text>
                                <View style={styles.optionsRow}>
                                    {SPICE_LEVELS.map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            style={[
                                                styles.optionButton,
                                                spiceLevel === level && styles.optionButtonActive,
                                            ]}
                                            onPress={() => setSpiceLevel(level)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    spiceLevel === level && styles.optionTextActive,
                                                ]}
                                            >
                                                {level}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Favourite Cuisines */}
                            <View style={styles.preferenceSection}>
                                <Text style={styles.sectionTitle}>Favourite Cuisines</Text>
                                <View style={styles.cuisineGrid}>
                                    {CUISINE_OPTIONS.map((cuisine) => (
                                        <TouchableOpacity
                                            key={cuisine}
                                            style={[
                                                styles.cuisineChip,
                                                selectedCuisines.includes(cuisine) && styles.cuisineChipActive,
                                            ]}
                                            onPress={() => toggleCuisine(cuisine)}
                                        >
                                            <Text
                                                style={[
                                                    styles.cuisineText,
                                                    selectedCuisines.includes(cuisine) && styles.cuisineTextActive,
                                                ]}
                                            >
                                                {cuisine}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Allergies */}
                            <View style={styles.preferenceSection}>
                                <Text style={styles.sectionTitle}>Allergies & Intolerances</Text>
                                <Text style={styles.sectionSubtitle}>
                                    Select common allergens or add custom ones
                                </Text>

                                <View style={styles.allergenGrid}>
                                    {COMMON_ALLERGENS.map((allergen) => (
                                        <TouchableOpacity
                                            key={allergen}
                                            style={[
                                                styles.allergenChip,
                                                allergies.includes(allergen) && styles.allergenChipActive,
                                            ]}
                                            onPress={() => toggleAllergy(allergen)}
                                        >
                                            <Text
                                                style={[
                                                    styles.allergenText,
                                                    allergies.includes(allergen) && styles.allergenTextActive,
                                                ]}
                                            >
                                                {allergen}
                                            </Text>
                                            {allergies.includes(allergen) && (
                                                <Ionicons name="checkmark" size={14} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Custom Allergy */}
                                <View style={styles.customAllergyRow}>
                                    <TextInput
                                        style={styles.customAllergyInput}
                                        value={newAllergy}
                                        onChangeText={setNewAllergy}
                                        placeholder="Add custom allergen..."
                                        placeholderTextColor="#9E9E9E"
                                    />
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={handleAddCustomAllergy}
                                    >
                                        <Ionicons name="add" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {/* Selected Allergies */}
                                {allergies.length > 0 && (
                                    <View style={styles.selectedAllergies}>
                                        <Text style={styles.selectedLabel}>Your allergies:</Text>
                                        <View style={styles.selectedTags}>
                                            {allergies.map((allergen, index) => (
                                                <TouchableOpacity
                                                    key={`${allergen}-${index}`}
                                                    style={styles.selectedTag}
                                                    onPress={() => handleRemoveAllergy(allergen)}
                                                >
                                                    <Text style={styles.selectedTagText}>{allergen}</Text>
                                                    <Ionicons name="close-circle" size={16} color="#EF4444" />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                                onPress={handleSavePreferences}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Preferences</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
            <Toast 
                visible={toast.visible} 
                message={toast.message} 
                type={toast.type} 
                onHide={() => setToast(prev => ({ ...prev, visible: false }))} 
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFCFF',
    },
    keyboardView: {
        flex: 1,
    },
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#181C2E',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: '#F0F5FA',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: '#fff',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A0A5BA',
    },
    tabTextActive: {
        color: '#181C2E',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#181C2E',
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#A0A5BA',
        marginBottom: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F0F5FA',
        padding: 14,
        borderRadius: 12,
        fontSize: 15,
        color: '#181C2E',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#FF7A00',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    preferenceSection: {
        marginBottom: 24,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F5FA',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    optionButtonActive: {
        backgroundColor: '#FFF4E5',
        borderColor: '#FF7A00',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    optionTextActive: {
        color: '#FF7A00',
    },
    cuisineGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    cuisineChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F5FA',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    cuisineChipActive: {
        backgroundColor: '#F0FDF4',
        borderColor: '#22C55E',
    },
    cuisineText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    cuisineTextActive: {
        color: '#22C55E',
    },
    allergenGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    allergenChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        borderWidth: 1.5,
        borderColor: '#EF4444',
        gap: 6,
    },
    allergenChipActive: {
        backgroundColor: '#EF4444',
    },
    allergenText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#EF4444',
    },
    allergenTextActive: {
        color: '#fff',
    },
    customAllergyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 16,
    },
    customAllergyInput: {
        flex: 1,
        backgroundColor: '#F0F5FA',
        padding: 14,
        borderRadius: 12,
        fontSize: 15,
        color: '#181C2E',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FF7A00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedAllergies: {
        marginTop: 16,
    },
    selectedLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    selectedTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    selectedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    selectedTagText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF7A00',
    },
});
