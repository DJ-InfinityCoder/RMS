import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { CustomTextInput } from '@/components/auth/CustomTextInput';
import { CustomButton } from '@/components/auth/CustomButton';
import { AuthTheme } from '@/constants/AuthTheme';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email format');
            return false;
        }

        setError('');
        return true;
    };

    const handleSendCode = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setLoading(false);
        console.log('Send reset code to:', email);
        // Redirect to verification screen
        router.push('/verification' as any);
    };

    return (
        <AuthContainer
            title="Forgot Password"
            subtitle="Please enter your email to receive a verification code"
            headerHeight={25}
        >
            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <CustomTextInput
                        label="Email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (error) setError('');
                        }}
                        placeholder="Enter your email"
                        error={error}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <CustomButton
                        label="SEND CODE"
                        onPress={handleSendCode}
                        loading={loading}
                        disabled={!email.trim()}
                    />
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
        marginTop: AuthTheme.spacing.xl,
    },
    buttonContainer: {
        marginTop: AuthTheme.spacing.xl,
        paddingBottom: AuthTheme.spacing.lg,
    },
});
