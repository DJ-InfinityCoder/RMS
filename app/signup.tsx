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
import { signUp } from '@/api/authApi';
import { AuthTheme } from '@/constants/AuthTheme';

const { height } = Dimensions.get('window');

export default function SignUpScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
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
        const result = await signUp({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
        });
        setLoading(false);

        if (result.success) {
            Alert.alert(
                'Account Created',
                'Your account has been created. If email verification is enabled, please check your inbox before logging in.',
                [
                    {
                        text: 'Go to Login',
                        onPress: () => router.replace('/login' as any),
                    },
                ]
            );
        } else {
            let errorMsg = result.error || 'Please try again';
            
            // Helpful tip for the "Email limit exceeded" issue
            if (errorMsg.includes('limit') || errorMsg.includes('exceeded')) {
                errorMsg = 'Email rate limit exceeded. Please wait a bit or disable "Confirm Email" in your Supabase Auth settings for easier testing.';
            }
            
            Alert.alert('Sign Up Failed', errorMsg);
        }
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                                <Ionicons name="person-outline" size={20} color={AuthTheme.colors.textGrey} />
                                <TextInput
                                    style={styles.inputField}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="Enter your name"
                                    placeholderTextColor={AuthTheme.colors.textGrey}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

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
                                    placeholder="Create a password"
                                    placeholderTextColor={AuthTheme.colors.textGrey}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
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

                        {/* Confirm Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color={AuthTheme.colors.textGrey} />
                                <TextInput
                                    style={styles.inputField}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={AuthTheme.colors.textGrey}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSignUp}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                    accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={AuthTheme.colors.textGrey}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                            onPress={handleSignUp}
                            disabled={loading}
                            accessibilityRole="button"
                            accessibilityLabel="Sign up"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signUpButtonText}>SIGN UP</Text>
                            )}
                        </TouchableOpacity>

                        {/* Terms */}
                        <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                                By signing up, you agree to our{' '}
                                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/login' as any)}
                            accessibilityLabel="Log in"
                        >
                            <Text style={styles.loginLink}>Log In</Text>
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
        paddingTop: height * 0.04,
        paddingBottom: height * 0.02,
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
        paddingTop: 28,
    },
    inputGroup: {
        marginBottom: 16,
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
        height: 54,
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
    signUpButton: {
        backgroundColor: AuthTheme.colors.darkNavy,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        marginTop: 8,
    },
    signUpButtonDisabled: {
        opacity: 0.7,
    },
    signUpButtonText: {
        color: AuthTheme.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    termsContainer: {
        marginTop: 20,
        paddingHorizontal: 8,
    },
    termsText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: AuthTheme.colors.primary,
        fontWeight: '600',
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
    loginLink: {
        fontSize: 15,
        color: AuthTheme.colors.primary,
        fontWeight: 'bold',
    },
});
