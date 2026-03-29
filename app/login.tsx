import { AuthContainer } from '@/components/auth/AuthContainer';
import { CustomButton } from '@/components/auth/CustomButton';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';


export default function LoginScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    //here
    const [role, setRole] = useState("restaurant");

    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        // if (!validateForm()) return;

        // setLoading(true);
        // try {
        //     const response = await fetch('/api/auth/login', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             email: formData.email,
        //             password: formData.password,
        //         }),
        //     });

        //     const result = await response.json();

        //     if (!response.ok) {
        //         setErrors({ email: result.error || 'Login failed' });
        //         return;
        //     }

        //     console.log('Login successful:', result.user);
        //     router.push('/(admin)' as any);
        // } catch (error) {
        //     console.error('Login error:', error);
        //     setErrors({ email: 'An error occurred during login' });
        // } finally {
        //     setLoading(false);
        // }
        if (!validateForm()) return;

    setLoading(true);
    try {
        // ✅ NEW: Dynamic endpoint selection
        const endpoint = role === "vendor" ? "/api/vendor/login" : "/api/auth/login";

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
                // Optional: You can still send role here if the backend needs it
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            setErrors({ email: result.error || 'Login failed' });
            return;
        }

        console.log('Login successful:', result.user);

        // ✅ NEW: Dynamic redirection based on role
        if (role === "vendor") {
            await SecureStore.setItemAsync('vendorEmail', result.user.email);
            await SecureStore.setItemAsync('vendorName', result.user.name);
            router.push('/vendor' as any);
        } else {
            router.push('/(admin)' as any);
        }


    } catch (error) {
        console.error('Login error:', error);
        setErrors({ email: 'An error occurred during login' });
    } finally {
        setLoading(false);
    }
    };

    

    const handleSocialLogin = (provider: string) => {
        console.log('Social login:', provider);
    };

    return (
        <AuthContainer
            title="Log In"
            subtitle="Please sign in to your existing account"
            headerHeight={25}
        >
            <View style={styles.formContainer}>
                {/* Role Selector */}
                <View style={styles.roleSelectorWrapper}>
                    <Text style={styles.roleTitle}>Sign In As</Text>
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

                <CustomTextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    placeholder="Enter your email"
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="mail-outline" size={20} color="#666" />}
                />

                <CustomTextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    placeholder="Enter your password"
                    error={errors.password}
                    secureTextEntry
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#666" />}
                />

                <View style={styles.optionsRow}>
                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            status={rememberMe ? 'checked' : 'unchecked'}
                            onPress={() => setRememberMe(!rememberMe)}
                            color={AuthTheme.colors.primary}
                        />
                        <Text style={styles.checkboxLabel}>Remember me</Text>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/forgot-password' as any)}>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <CustomButton label="LOG IN" onPress={handleLogin} loading={loading} />
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>Or</Text>
                    <View style={styles.divider} />
                </View>

                <View style={styles.socialContainer}>
                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: '#F5F5F5' }]}
                        onPress={() => handleSocialLogin('google')}
                    >
                        <Ionicons name="logo-google" size={24} color="#DB4437" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: AuthTheme.colors.facebook }]}
                        onPress={() => handleSocialLogin('facebook')}
                    >
                        <Ionicons name="logo-facebook" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, { backgroundColor: AuthTheme.colors.apple }]}
                        onPress={() => handleSocialLogin('apple')}
                    >
                        <Ionicons name="logo-apple" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/signup' as any)}>
                        <Text style={styles.signUpLink}>SIGN UP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AuthContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    formContainer: {
        marginTop: AuthTheme.spacing.md,
        paddingBottom: 20,
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

    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: AuthTheme.spacing.sm,
        marginBottom: AuthTheme.spacing.lg,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#666',
    },
    forgotPassword: {
        fontSize: 14,
        color: AuthTheme.colors.primary,
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: AuthTheme.spacing.md,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: AuthTheme.spacing.lg,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: AuthTheme.spacing.md,
        color: AuthTheme.colors.textGrey,
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: AuthTheme.spacing.md,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: AuthTheme.spacing.lg,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    signUpLink: {
        fontSize: 14,
        color: AuthTheme.colors.primary,
        fontWeight: 'bold',
    },
});
