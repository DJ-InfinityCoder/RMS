import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthTheme } from '@/constants/AuthTheme';

interface CustomButtonProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    label,
    onPress,
    loading = false,
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={AuthTheme.colors.white} />
            ) : (
                <Text style={styles.buttonText}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: AuthTheme.colors.primary,
        paddingVertical: AuthTheme.spacing.md,
        borderRadius: AuthTheme.borderRadius.medium,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 50,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: AuthTheme.colors.white,
        fontSize: AuthTheme.typography.buttonSize,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
