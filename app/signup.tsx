import { AuthContainer } from '@/components/auth/AuthContainer';
import { CustomButton } from '@/components/auth/CustomButton';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { AuthTheme } from '@/constants/AuthTheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SignUpScreen() {
    const router = useRouter();
    const [role, setRole] = useState("restaurant");
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        restaurantName: '',
        restaurantAddress: '',
        city: '',
        restaurantPhone: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.restaurantName.trim()) {
            newErrors.restaurantName = 'Restaurant name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // ✅ Determine endpoint based on role
            const endpoint = role === "vendor" ? "/api/vendor/signup" : "/api/auth/signup";

            const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // ✅ Conditional body based on role
            body: JSON.stringify(
                role === "vendor"
                    ? {
                        name: formData.restaurantName,
                        email: formData.email,
                        mobile: formData.restaurantPhone, // Map phone to mobile for vendors
                      }
                    : {
                        name: formData.restaurantName,
                        email: formData.email,
                        password: formData.password,
                        restaurantAddress: formData.restaurantAddress,
                        city: formData.city,
                        restaurantPhone: formData.restaurantPhone,
                      }
            ),
            });

            const result = await response.json();

            if (!response.ok) {
                setErrors({ email: result.error || 'Signup failed' });
                return;
            }

            router.push('/login' as any);
        } catch (error) {
            setErrors({ email: 'An error occurred during signup' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer
            title="Register Restaurant"
            subtitle="Create an account and set up your restaurant"
            headerHeight={25}
        >
            <View style={styles.content}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        {/* ✅ NEW: Role Selector (Same as Login) */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>Select Role</Text>
                            <View style={{ flexDirection: "row", gap: 20, marginTop: 8 }}>
                                <TouchableOpacity onPress={() => setRole("restaurant")}>
                                    <Text style={{ 
                                        fontSize: 16, 
                                        fontWeight: 'bold', 
                                        color: role === "restaurant" ? AuthTheme.colors.primary : "#999" 
                                    }}>
                                        RESTAURANT
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setRole("vendor")}>
                                    <Text style={{ 
                                        fontSize: 16, 
                                        fontWeight: 'bold', 
                                        color: role === "vendor" ? AuthTheme.colors.primary : "#999" 
                                    }}>
                                        VENDOR
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ✅ Dynamic Header */}
                        <Text style={styles.sectionHeader}>
                            {role === "vendor" ? "Vendor Account Details" : "Restaurant Account Details"}
                        </Text>


                        <Text style={styles.sectionHeader}>Restaurant Account Details</Text>
                        
                        <CustomTextInput
                            label="Restaurant Name"
                            value={formData.restaurantName}
                            onChangeText={(text) => setFormData({ ...formData, restaurantName: text })}
                            placeholder="e.g. The Spicy Bistro"
                            error={errors.restaurantName}
                        />

                        <CustomTextInput
                            label="Email Address"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Manager's email"
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <CustomTextInput
                            label="Password"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            placeholder="Create password"
                            error={errors.password}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <CustomTextInput
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            onChangeText={(text) =>
                                setFormData({ ...formData, confirmPassword: text })
                            }
                            placeholder="Re-enter password"
                            error={errors.confirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Location & Contact</Text>
                        
                        <CustomTextInput
                            label="Full Address"
                            value={formData.restaurantAddress}
                            onChangeText={(text) => setFormData({ ...formData, restaurantAddress: text })}
                            placeholder="Complete address"
                            multiline
                        />

                        <CustomTextInput
                            label="City"
                            value={formData.city}
                            onChangeText={(text) => setFormData({ ...formData, city: text })}
                            placeholder="Enter city"
                        />

                        <CustomTextInput
                            label="Contact Number"
                            value={formData.restaurantPhone}
                            onChangeText={(text) => setFormData({ ...formData, restaurantPhone: text })}
                            placeholder="Restaurant phone line"
                            keyboardType="phone-pad"
                        />
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <CustomButton label="SIGN UP" onPress={handleSignUp} loading={loading} />
                </View>
            </View>
        </AuthContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    formContainer: {
        marginTop: AuthTheme.spacing.md,
    },
    buttonContainer: {
        marginTop: AuthTheme.spacing.md,
        paddingBottom: AuthTheme.spacing.lg,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: AuthTheme.colors.primary,
        marginBottom: 15,
        backgroundColor: '#F8F9FA',
        padding: 8,
        borderRadius: 5,
    },
});
