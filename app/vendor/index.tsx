import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthTheme } from '@/constants/AuthTheme';
import * as SecureStore from 'expo-secure-store';

export default function VendorDashboard() {
    const router = useRouter();
    const [vendorData, setVendorData] = useState({
        name: 'Merchant Partner',
        email: 'vendor@example.com',
        phone: '+91 9876543210'
    });

    const fetchVendor = useCallback(async () => {
        const name = await SecureStore.getItemAsync('vendorName');
        const email = await SecureStore.getItemAsync('vendorEmail');
        if (name) setVendorData(prev => ({ ...prev, name, email: email || prev.email }));
        
        if (name) {
            try {
                const res = await fetch(`/api/vendor/profile?name=${encodeURIComponent(name)}`);
                if (res.ok) {
                   const data = await res.json();
                   if (data?.mobile) setVendorData(prev => ({ ...prev, phone: data.mobile }));
                }
            } catch (e) {}
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchVendor();
        }, [fetchVendor])
    );

    const updateLoginDetail = async (type: 'email' | 'phone') => {
        const title = type === 'email' ? 'Update Email' : 'Update Phone Number';
        
        Alert.prompt(title, `Enter your new ${type}`, async (value: string) => {
            if (!value) return;
            
            try {
                const oldEmail = await SecureStore.getItemAsync('vendorEmail');
                const response = await fetch('/api/vendor/login/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        oldEmail,
                        [type === 'email' ? 'newEmail' : 'newMobile']: value
                    })
                });

                if (response.ok) {
                    if (type === 'email') await SecureStore.setItemAsync('vendorEmail', value);
                    setVendorData(prev => ({ ...prev, [type === 'email' ? 'email' : 'phone']: value }));
                    Alert.alert('Success', `${type.charAt(0).toUpperCase() + type.slice(1)} updated!`);
                } else {
                    Alert.alert('Error', 'Update failed. Please try again.');
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred.');
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Manage Your Business,</Text>
                        <Text style={styles.vendorName}>{vendorData.name}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.profileIcon}
                        onPress={() => router.push('/vendor/profile')}
                    >
                        <View style={styles.avatar}>
                            <Ionicons name="storefront" size={24} color={AuthTheme.colors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Configuration</Text>
                    <TouchableOpacity 
                        style={styles.mainActionButton}
                        onPress={() => router.push('/vendor/profile')}
                    >
                        <View style={styles.actionIconWrapper}>
                            <Ionicons name="business" size={28} color="#FFF" />
                        </View>
                        <View style={styles.actionTextWrapper}>
                            <Text style={styles.actionTitle}>Update Business Profile</Text>
                            <Text style={styles.actionSubtitle}>Modify name, address, and offerings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>Login Credentials</Text>
                    
                    <View style={styles.detailsCard}>
                        <View style={styles.detailItem}>
                            <Ionicons name="mail-outline" size={20} color="#666" />
                            <View style={styles.detailText}>
                                <Text style={styles.detailLabel}>Registered Email</Text>
                                <Text style={styles.detailValue}>{vendorData.email}</Text>
                            </View>
                            <TouchableOpacity onPress={() => updateLoginDetail('email')}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.divider} />

                        <View style={styles.detailItem}>
                            <Ionicons name="call-outline" size={20} color="#666" />
                            <View style={styles.detailText}>
                                <Text style={styles.detailLabel}>Registered Phone</Text>
                                <Text style={styles.detailValue}>{vendorData.phone}</Text>
                            </View>
                            <TouchableOpacity onPress={() => updateLoginDetail('phone')}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.changePasswordRow} onPress={() => Alert.alert('Reset Password', 'Instructions sent to your email.')}>
                            <Ionicons name="lock-closed-outline" size={20} color={AuthTheme.colors.primary} />
                            <Text style={styles.changePasswordText}>Change Account Password</Text>
                            <Ionicons name="chevron-forward" size={18} color={AuthTheme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={() => router.push('/login' as any)}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={styles.logoutText}>Sign Out Account</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 25,
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    vendorName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#181924',
        marginTop: 4,
    },
    profileIcon: {
        padding: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: AuthTheme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: AuthTheme.colors.primary + '30',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    mainActionButton: {
        backgroundColor: AuthTheme.colors.primary,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: AuthTheme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    actionIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionTextWrapper: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    actionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    detailsCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailText: {
        flex: 1,
        marginLeft: 15,
    },
    detailLabel: {
        fontSize: 12,
        color: '#9E9E9E',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    editText: {
        color: AuthTheme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F2F5',
        marginVertical: 4,
    },
    changePasswordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        gap: 12,
    },
    changePasswordText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: AuthTheme.colors.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 15,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FF3B3020',
        gap: 10,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 15,
        fontWeight: 'bold',
    },
});