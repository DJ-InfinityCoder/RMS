import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MapDirectionsScreen() {
  const router = useRouter();
  const { lat, lng, name } = useLocalSearchParams<{ lat?: string; lng?: string; name?: string }>();

  const openMaps = () => {
    if (!lat || !lng) return;
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Directions</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.content}>
        <Ionicons name="navigate-circle-outline" size={64} color="#FF7A00" />
        <Text style={styles.destName}>{name ?? 'Restaurant'}</Text>
        <TouchableOpacity style={styles.openBtn} onPress={openMaps}>
          <Ionicons name="map" size={20} color="#FFF" />
          <Text style={styles.openBtnText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  destName: { fontSize: 20, fontWeight: '700', color: '#181C2E', marginTop: 16, marginBottom: 24, textAlign: 'center' },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  openBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
