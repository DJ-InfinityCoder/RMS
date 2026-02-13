import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { CustomButton } from '@/components/auth/CustomButton';
import { AuthTheme } from '@/constants/AuthTheme';

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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setLoading(false);
        console.log('Sign Up:', formData);
        // Redirect to login after successful signup
        router.push('/login' as any);
    };

    return (
        <AuthContainer
            title="Sign Up"
            subtitle="Please sign up to get started"
            headerHeight={25}
        >
            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <CustomTextInput
                        label="Name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Enter your name"
                        error={errors.name}
                        autoCapitalize="words"
                    />

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

                    <CustomTextInput
                        label="Re-type Password"
                        value={formData.confirmPassword}
                        onChangeText={(text) =>
                            setFormData({ ...formData, confirmPassword: text })
                        }
                        placeholder="Re-enter your password"
                        error={errors.confirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

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
        marginTop: AuthTheme.spacing.xl,
        paddingBottom: AuthTheme.spacing.lg,
    },
});
