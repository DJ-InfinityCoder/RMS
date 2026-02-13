import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { AuthTheme } from '@/constants/AuthTheme';

interface CustomTextInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
    label,
    error,
    ...props
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label.toUpperCase()}</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={AuthTheme.colors.textGrey}
                {...props}
            />
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
    input: {
        backgroundColor: AuthTheme.colors.inputBackground,
        borderRadius: AuthTheme.borderRadius.small,
        paddingHorizontal: AuthTheme.spacing.md,
        paddingVertical: AuthTheme.spacing.md,
        fontSize: 16,
        color: '#000',
        borderWidth: 0,
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: AuthTheme.spacing.xs,
    },
});
