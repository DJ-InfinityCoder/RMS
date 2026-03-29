import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { AuthTheme } from '@/constants/AuthTheme';

interface CustomTextInputProps extends TextInputProps {
    label: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
    label,
    error,
    leftIcon,
    ...props
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label.toUpperCase()}</Text>
            <View style={[styles.inputWrapper, error && styles.inputError]}>
                {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={AuthTheme.colors.textGrey}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        marginBottom: AuthTheme.spacing.md,
    },
    label: {
        fontSize: AuthTheme.typography.inputLabelSize,
        color: AuthTheme.colors.textGrey,
        marginBottom: AuthTheme.spacing.sm,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AuthTheme.colors.inputBackground,
        borderRadius: AuthTheme.borderRadius.small,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    iconContainer: {
        paddingLeft: AuthTheme.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: AuthTheme.spacing.md,
        paddingVertical: AuthTheme.spacing.md,
        fontSize: 16,
        color: '#000',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: AuthTheme.spacing.xs,
    },
});

