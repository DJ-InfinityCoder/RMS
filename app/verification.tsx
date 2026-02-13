import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { CustomButton } from '@/components/auth/CustomButton';
import { AuthTheme } from '@/constants/AuthTheme';

export default function VerificationScreen() {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleOtpChange = (value: string, index: number) => {
        // Only allow single digit
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) return;

        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setLoading(false);
        console.log('Verifying OTP:', otpCode);
    };

    return (
        <AuthContainer
            title="Verification"
            subtitle="We have sent a code to your email"
            headerHeight={28}
        >
            <View style={styles.content}>
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                inputRefs.current[index] = ref;
                            }}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    <CustomButton
                        label="VERIFY"
                        onPress={handleVerify}
                        loading={loading}
                        disabled={otp.join('').length !== 4}
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: AuthTheme.spacing.xl,
        paddingHorizontal: AuthTheme.spacing.lg,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderRadius: AuthTheme.borderRadius.medium,
        backgroundColor: AuthTheme.colors.inputBackground,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    buttonContainer: {
        marginTop: AuthTheme.spacing.xl,
        paddingBottom: AuthTheme.spacing.lg,
    },
});
