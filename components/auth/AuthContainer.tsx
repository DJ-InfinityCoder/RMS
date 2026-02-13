import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthTheme } from '@/constants/AuthTheme';

interface AuthContainerProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    headerHeight?: number;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
    title,
    subtitle,
    children,
    headerHeight = 25,
}) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section - Dark Navy */}
                    <View style={[styles.header, { height: `${headerHeight}%` }]}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>

                    {/* Content Section - White Container */}
                    <View style={styles.contentContainer}>
                        {children}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

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
        backgroundColor: AuthTheme.colors.darkNavy,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: AuthTheme.spacing.lg,
    },
    title: {
        fontSize: AuthTheme.typography.headerSize,
        fontWeight: 'bold',
        color: AuthTheme.colors.white,
        marginBottom: AuthTheme.spacing.sm,
    },
    subtitle: {
        fontSize: AuthTheme.typography.subheaderSize,
        color: AuthTheme.colors.white,
        textAlign: 'center',
        opacity: 0.8,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: AuthTheme.colors.white,
        borderTopLeftRadius: AuthTheme.borderRadius.large,
        borderTopRightRadius: AuthTheme.borderRadius.large,
        paddingHorizontal: AuthTheme.spacing.lg,
        paddingTop: AuthTheme.spacing.xl,
        paddingBottom: AuthTheme.spacing.lg,
    },
});
