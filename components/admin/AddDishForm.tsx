import { CustomButton } from '@/components/auth/CustomButton';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';

interface AddDishFormProps {
    restaurantId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddDishForm: React.FC<AddDishFormProps> = ({ restaurantId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        cooking_method: '',
        calories: '',
        recommended_for: '',
        image_url: '',
        is_available: true,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.category.trim()) newErrors.category = 'Category is required';
        if (!formData.price) newErrors.price = 'Price is required';
        else if (isNaN(parseFloat(formData.price))) newErrors.price = 'Price must be a number';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            console.log('Submitting dish to restaurant:', restaurantId);
            const response = await fetch(`/api/restaurants/${restaurantId}/dishes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create dish');
            }

            Alert.alert('Success', 'Menu item added successfully');
            onSuccess();
        } catch (error: any) {
            console.error('Submit error:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Add New Menu Item</Text>
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
                    label="Dish Name *"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    error={errors.name}
                    placeholder="e.g. Butter Chicken"
                />

                <CustomTextInput
                    label="Category (e.g. Main Course, Starters) *"
                    value={formData.category}
                    onChangeText={(text) => setFormData({ ...formData, category: text })}
                    error={errors.category}
                    placeholder="e.g. Main Course"
                />

                <CustomTextInput
                    label="Price (₹) *"
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    error={errors.price}
                    keyboardType="numeric"
                    placeholder="e.g. 450"
                />

                <CustomTextInput
                    label="Description"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                    placeholder="Brief description of the dish"
                />

                <CustomTextInput
                    label="Cooking Method"
                    value={formData.cooking_method}
                    onChangeText={(text) => setFormData({ ...formData, cooking_method: text })}
                    placeholder="e.g. Tandoor"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <CustomTextInput
                            label="Calories"
                            value={formData.calories}
                            onChangeText={(text) => setFormData({ ...formData, calories: text })}
                            keyboardType="numeric"
                            placeholder="e.g. 350"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <CustomTextInput
                            label="Recommended For"
                            value={formData.recommended_for}
                            onChangeText={(text) => setFormData({ ...formData, recommended_for: text })}
                            placeholder="e.g. Lunch"
                        />
                    </View>
                </View>

                <CustomTextInput
                    label="Image URL"
                    value={formData.image_url}
                    onChangeText={(text) => setFormData({ ...formData, image_url: text })}
                    placeholder="https://example.com/dish.jpg"
                />

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Available in Menu</Text>
                    <Switch
                        value={formData.is_available}
                        onValueChange={(value) => setFormData({ ...formData, is_available: value })}
                        trackColor={{ false: '#767577', true: AuthTheme.colors.primary }}
                        thumbColor={formData.is_available ? AuthTheme.colors.white : '#f4f3f4'}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <CustomButton
                        label="ADD ITEM TO MENU"
                        onPress={handleSubmit}
                        loading={loading}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        maxHeight: '75%',
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
        paddingBottom: 15,
    },
    row: {
        flexDirection: 'row',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingHorizontal: 5,
        backgroundColor: '#F9F9F9',
        padding: 10,
        borderRadius: 10,
    },
    switchLabel: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    buttonRow: {
        marginTop: 10,
        marginBottom: 10,
    },
    closeBtn: {
        position: 'absolute',
        right: 15,
        top: 15,
        padding: 4,
    },
});
