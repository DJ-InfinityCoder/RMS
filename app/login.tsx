import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { login } from '@/api/authApi';
import { AuthTheme } from '@/constants/AuthTheme';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
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
        const result = await login({
            email: formData.email.trim(),
            password: formData.password,
        });
        setLoading(false);

        if (result.success) {
            router.replace('/(tabs)' as any);
        } else {
            let errorMsg = result.error || 'Please check your credentials';
            
            // Helpful tip for verification issues
            if (errorMsg.includes('confirmed') || errorMsg.includes('verify')) {
                errorMsg = 'Email not confirmed. Please check your inbox or disable "Confirm Email" in Supabase for testing.';
            } else if (errorMsg.includes('limit') || errorMsg.includes('exceeded')) {
                errorMsg = 'Too many requests. Please wait a moment.';
            }
            
            Alert.alert('Login Failed', errorMsg);
        }
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert('Coming Soon', `${provider} login will be available soon`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="restaurant" size={48} color={AuthTheme.colors.primary} />
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                                <Ionicons name="mail-outline" size={20} color={AuthTheme.colors.textGrey} />
                                <TextInput
                                    style={styles.inputField}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    placeholder="Enter your email"
                                    placeholderTextColor={AuthTheme.colors.textGrey}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color={AuthTheme.colors.textGrey} />
                                <TextInput
                                    style={styles.inputField}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    placeholder="Enter your password"
                                    placeholderTextColor={AuthTheme.colors.textGrey}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={AuthTheme.colors.textGrey}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Remember Me & Forgot Password */}
                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: rememberMe }}
                            >
                                <Checkbox
                                    status={rememberMe ? 'checked' : 'unchecked'}
                                    onPress={() => setRememberMe(!rememberMe)}
                                    color={AuthTheme.colors.primary}
                                />
                                <Text style={styles.checkboxLabel}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push('/forgot-password' as any)}
                                accessibilityLabel="Forgot password"
                            >
                                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            accessibilityRole="button"
                            accessibilityLabel="Login"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>LOG IN</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>Or continue with</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: AuthTheme.colors.facebook }]}
                                onPress={() => handleSocialLogin('Facebook')}
                                accessibilityLabel="Login with Facebook"
                            >
                                <Ionicons name="logo-facebook" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: AuthTheme.colors.twitter }]}
                                onPress={() => handleSocialLogin('Twitter')}
                                accessibilityLabel="Login with Twitter"
                            >
                                <Ionicons name="logo-twitter" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: AuthTheme.colors.apple }]}
                                onPress={() => handleSocialLogin('Apple')}
                                accessibilityLabel="Login with Apple"
                            >
                                <Ionicons name="logo-apple" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/signup' as any)}
                            accessibilityLabel="Sign up"
                        >
                            <Text style={styles.signUpLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AuthTheme.colors.darkNavy,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: height * 0.05,
        paddingBottom: height * 0.03,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 122, 40, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: AuthTheme.colors.white,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: AuthTheme.colors.white,
        opacity: 0.7,
    },
    formContainer: {
        flex: 1,
        backgroundColor: AuthTheme.colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AuthTheme.colors.inputBackground,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingHorizontal: 12,
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 6,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
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
    loginButton: {
        backgroundColor: AuthTheme.colors.darkNavy,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: AuthTheme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: AuthTheme.colors.textGrey,
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: AuthTheme.colors.white,
    },
    footerText: {
        fontSize: 15,
        color: '#666',
    },
    signUpLink: {
        fontSize: 15,
        color: AuthTheme.colors.primary,
        fontWeight: 'bold',
    },
});
