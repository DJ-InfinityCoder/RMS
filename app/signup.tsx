import { AuthContainer } from '@/components/auth/AuthContainer';
import { CustomButton } from '@/components/auth/CustomButton';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { AuthTheme } from '@/constants/AuthTheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


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
            <View style={styles.formContainer}>
                {/* Role Selector */}
                <View style={styles.roleSelectorWrapper}>
                    <Text style={styles.roleTitle}>Create Account As</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity 
                            onPress={() => setRole("restaurant")}
                            style={[styles.roleLabelWrapper, role === "restaurant" && styles.activeRoleWrapper]}
                        >
                            <Ionicons 
                                name="restaurant-outline" 
                                size={20} 
                                color={role === "restaurant" ? AuthTheme.colors.primary : "#999"} 
                            />
                            <Text style={[styles.roleLabel, role === "restaurant" && styles.activeRoleText]}>
                                RESTAURANT
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setRole("vendor")}
                            style={[styles.roleLabelWrapper, role === "vendor" && styles.activeRoleWrapper]}
                        >
                            <Ionicons 
                                name="business-outline" 
                                size={20} 
                                color={role === "vendor" ? AuthTheme.colors.primary : "#999"} 
                            />
                            <Text style={[styles.roleLabel, role === "vendor" && styles.activeRoleText]}>
                                VENDOR
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dynamic Title */}
                <Text style={styles.sectionHeader}>
                    {role === "vendor" ? "Vendor Details" : "Restaurant Details"}
                </Text>

                <CustomTextInput
                    label={role === "vendor" ? "Vendor Name" : "Restaurant Name"}
                    value={formData.restaurantName}
                    onChangeText={(text) => setFormData({ ...formData, restaurantName: text })}
                    placeholder={role === "vendor" ? "e.g. Fresh Veggie Co" : "e.g. The Spicy Bistro"}
                    error={errors.restaurantName}
                    leftIcon={<Ionicons name="person-outline" size={20} color="#666" />}
                />

                <CustomTextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter email address"
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="mail-outline" size={20} color="#666" />}
                />

                <CustomTextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    placeholder="Create a strong password"
                    error={errors.password}
                    secureTextEntry
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#666" />}
                />

                <CustomTextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    placeholder="Re-enter password"
                    error={errors.confirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="#666" />}
                />

                {role !== "vendor" && (
                    <>
                        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Location & Contact</Text>
                        
                        <CustomTextInput
                            label="Full Address"
                            value={formData.restaurantAddress}
                            onChangeText={(text) => setFormData({ ...formData, restaurantAddress: text })}
                            placeholder="Complete address"
                            multiline
                            leftIcon={<Ionicons name="location-outline" size={20} color="#666" />}
                        />

                        <CustomTextInput
                            label="City"
                            value={formData.city}
                            onChangeText={(text) => setFormData({ ...formData, city: text })}
                            placeholder="Enter city"
                            leftIcon={<Ionicons name="map-outline" size={20} color="#666" />}
                        />
                    </>
                )}

                <CustomTextInput
                    label="Contact Number"
                    value={formData.restaurantPhone}
                    onChangeText={(text) => setFormData({ ...formData, restaurantPhone: text })}
                    placeholder="Primary contact number"
                    keyboardType="phone-pad"
                    leftIcon={<Ionicons name="call-outline" size={20} color="#666" />}
                />

                <View style={styles.buttonContainer}>
                    <CustomButton label="CREATE ACCOUNT" onPress={handleSignUp} loading={loading} />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/login' as any)}>
                        <Text style={styles.loginLink}>LOG IN</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AuthContainer>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        marginTop: AuthTheme.spacing.md,
        paddingBottom: 40,
    },
    roleSelectorWrapper: {
        marginBottom: 24,
    },
    roleTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleLabelWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F5F6F7',
        borderWidth: 1,
        borderColor: '#EEE',
        gap: 8,
    },
    activeRoleWrapper: {
        backgroundColor: '#FFF1E8',
        borderColor: AuthTheme.colors.primary,
        borderWidth: 1.5,
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    activeRoleText: {
        color: AuthTheme.colors.primary,
    },
    sectionHeader: {
        fontSize: 15,
        fontWeight: 'bold',
        color: AuthTheme.colors.primary,
        marginBottom: 16,
        backgroundColor: '#FBFBFB',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: AuthTheme.colors.primary,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: AuthTheme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

