import { AuthContainer } from '@/components/auth/AuthContainer';
import { CustomButton } from '@/components/auth/CustomButton';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function LoginScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
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
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setErrors({ email: result.error || 'Login failed' });
                return;
            }

            console.log('Login successful:', result.user);
            router.push('/dashboard' as any);
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
            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <CustomTextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="Enter your email"
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <CustomTextInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        placeholder="Enter your password"
                        error={errors.password}
                        secureTextEntry
                        autoCapitalize="none"
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
                            <Text style={styles.forgotPassword}>Forgot Password</Text>
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
                            style={[styles.socialButton, { backgroundColor: AuthTheme.colors.facebook }]}
                            onPress={() => handleSocialLogin('facebook')}
                        >
                            <Ionicons name="logo-facebook" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: AuthTheme.colors.twitter }]}
                            onPress={() => handleSocialLogin('twitter')}
                        >
                            <Ionicons name="logo-twitter" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: AuthTheme.colors.apple }]}
                            onPress={() => handleSocialLogin('apple')}
                        >
                            <Ionicons name="logo-apple" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don&apos;t have an account? </Text>
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
        justifyContent: 'space-between',
    },
    formContainer: {
        marginTop: AuthTheme.spacing.md,
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
