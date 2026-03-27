import { AuthTheme } from '@/constants/AuthTheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, Platform } from 'react-native';

const C = AuthTheme.colors;

interface SkeletonItemProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { width: width as any, height: height as any, borderRadius, opacity },
                style,
            ]}
        />
    );
};

export const SkeletonLoader = {
    Stats: () => (
        <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.statCard}>
                    <View style={styles.statTop}>
                        <SkeletonItem width={60} height={12} />
                        <SkeletonItem width={30} height={30} borderRadius={8} />
                    </View>
                    <SkeletonItem width={80} height={32} style={{ marginTop: 8 }} />
                </View>
            ))}
        </View>
    ),

    OrderCard: () => (
        <View style={styles.orderCard}>
            <View style={styles.cardTop}>
                <SkeletonItem width={40} height={40} borderRadius={20} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <SkeletonItem width={80} height={14} />
                        <SkeletonItem width={60} height={20} borderRadius={6} />
                    </View>
                    <SkeletonItem width={120} height={16} style={{ marginTop: 6 }} />
                    <SkeletonItem width={100} height={12} style={{ marginTop: 6 }} />
                </View>
            </View>
            <View style={styles.cardBottom}>
                <SkeletonItem width="100%" height={1} style={{ marginVertical: 12 }} />
                <SkeletonItem width={80} height={24} style={{ alignSelf: 'center' }} />
            </View>
        </View>
    ),

    MenuItem: () => (
        <View style={styles.orderCard}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <SkeletonItem width={70} height={70} borderRadius={12} />
                <View style={{ flex: 1 }}>
                    <SkeletonItem width="80%" height={18} />
                    <SkeletonItem width="100%" height={12} style={{ marginTop: 6 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                        <SkeletonItem width={50} height={16} />
                        <SkeletonItem width={50} height={16} />
                    </View>
                </View>
            </View>
        </View>
    ),

    Profile: () => (
        <View style={{ alignItems: 'center' }}>
            <SkeletonItem width={72} height={72} borderRadius={36} />
            <SkeletonItem width={150} height={24} style={{ marginTop: 12 }} />
            <SkeletonItem width={200} height={14} style={{ marginTop: 8 }} />
            <SkeletonItem width={80} height={28} borderRadius={14} style={{ marginTop: 12 }} />
            
            <View style={[styles.statsGrid, { marginTop: 24 }]}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={styles.statCard}>
                        <SkeletonItem width={40} height={40} borderRadius={20} style={{ alignSelf: 'center' }} />
                        <SkeletonItem width={40} height={24} style={{ alignSelf: 'center', marginTop: 8 }} />
                        <SkeletonItem width={50} height={10} style={{ alignSelf: 'center', marginTop: 4 }} />
                    </View>
                ))}
            </View>
        </View>
    ),
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E1E9EE',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: C.white,
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    statTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderCard: {
        backgroundColor: C.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardTop: {
        flexDirection: 'row',
    },
    cardBottom: {
        marginTop: 4,
    },
});
