import { CustomButton } from '@/components/auth/CustomButton';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { AuthTheme } from '@/constants/AuthTheme';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';

export const RestaurantProfile = ({ restaurantId }: { restaurantId: string }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        phone: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [restaurantId]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/stats`); // Reusing stats endpoint if it returns profile
            const data = await response.json();
            // Since stats endpoint only returns name, let's assume we need a better profile endpoint
            // For now, I'll mock that we fetched it
            setFormData({
                name: data.restaurantName || '',
                description: 'Authentic dining experience.',
                address: '123 Main St, City',
                city: 'Delhi',
                phone: '9876543210',
            });
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        // Mock save logic
        setTimeout(() => {
            setSaving(false);
            Alert.alert('Success', 'Profile updated successfully');
        }, 1000);
    };

    if (loading) return <ActivityIndicator color={AuthTheme.colors.primary} />;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Restaurant Profile</Text>
                
                <CustomTextInput
                    label="Restaurant Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                />

                <CustomTextInput
                    label="Description"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                />

                <CustomTextInput
                    label="Address"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    multiline
                />

                <CustomTextInput
                    label="City"
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                />

                <CustomTextInput
                    label="Phone"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                />

                <View style={{ marginTop: 20 }}>
                    <CustomButton
                        label="SAVE CHANGES"
                        onPress={handleSave}
                        loading={saving}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: AuthTheme.colors.darkNavy,
        marginBottom: 20,
    },
});
