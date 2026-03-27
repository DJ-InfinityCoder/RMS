import { CustomButton } from '@/components/auth/CustomButton';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { AuthTheme } from '@/constants/AuthTheme';
import { DatePickerModal } from './DatePickerModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';

interface AddOfferFormProps {
    restaurantId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddOfferForm: React.FC<AddOfferFormProps> = ({ restaurantId, onSuccess, onCancel }) => {
    const C = AuthTheme.colors;
    const [formData, setFormData] = useState({
        title: '',
        discount_percent: '',
        valid_from: '',
        valid_to: '',
        is_active: true,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dateSelector, setDateSelector] = useState<{ visible: boolean; field: 'valid_from' | 'valid_to' | null }>({
        visible: false,
        field: null,
    });

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.discount_percent) newErrors.discount_percent = 'Discount is required';
        else if (isNaN(parseInt(formData.discount_percent))) newErrors.discount_percent = 'Must be a number';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/offers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create offer');
            }

            Alert.alert('Success', 'Offer created successfully');
            onSuccess();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Create New Offer</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
                    <Ionicons name="close" size={24} color={AuthTheme.colors.darkNavy} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.formScroll}
                contentContainerStyle={styles.formContent}
            >
                <CustomTextInput
                    label="Offer Title *"
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    error={errors.title}
                    placeholder="e.g. Weekend Special, IPL Promo"
                />

                <CustomTextInput
                    label="Discount Percentage (%) *"
                    value={formData.discount_percent}
                    onChangeText={(text) => setFormData({ ...formData, discount_percent: text })}
                    error={errors.discount_percent}
                    keyboardType="numeric"
                    placeholder="e.g. 15"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <TouchableOpacity 
                            onPress={() => setDateSelector({ visible: true, field: 'valid_from' })}
                            activeOpacity={0.7}
                        >
                            <View pointerEvents="none">
                                <CustomTextInput
                                    label="Start Date"
                                    value={formData.valid_from}
                                    placeholder="Select Date"
                                    editable={false}
                                />
                            </View>
                            <Ionicons name="calendar-outline" size={18} color={C.primary} style={styles.fieldIcon} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity 
                            onPress={() => setDateSelector({ visible: true, field: 'valid_to' })}
                            activeOpacity={0.7}
                        >
                            <View pointerEvents="none">
                                <CustomTextInput
                                    label="End Date"
                                    value={formData.valid_to}
                                    placeholder="Select Date"
                                    editable={false}
                                />
                            </View>
                            <Ionicons name="calendar-outline" size={18} color={C.primary} style={styles.fieldIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Active Right Now</Text>
                    <Switch
                        value={formData.is_active}
                        onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                        trackColor={{ false: '#767577', true: AuthTheme.colors.primary }}
                        thumbColor={formData.is_active ? AuthTheme.colors.white : '#f4f3f4'}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <CustomButton
                        label="PUBLISH OFFER"
                        onPress={handleSubmit}
                        loading={loading}
                    />
                </View>
            </ScrollView>

            {/* Date Picker Modal */}
            <DatePickerModal
                visible={dateSelector.visible}
                title={dateSelector.field === 'valid_from' ? 'Selection Start Date' : 'Selection End Date'}
                onClose={() => setDateSelector({ ...dateSelector, visible: false })}
                onSelect={(date) => {
                    if (dateSelector.field) {
                        setFormData({ ...formData, [dateSelector.field]: date });
                    }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        color: AuthTheme.colors.darkNavy,
        textAlign: 'center',
    },
    formScroll: {
        paddingHorizontal: 20,
    },
    formContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    row: {
        flexDirection: 'row',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 10,
    },
    switchLabel: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    buttonRow: {
        marginTop: 5,
        marginBottom: 20,
    },
    closeBtn: {
        position: 'absolute',
        right: 15,
        top: 15,
        padding: 4,
    },
    fieldIcon: {
        position: 'absolute',
        right: 12,
        top: 42,
    },
});
