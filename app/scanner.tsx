import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScannerWidget } from '@/components/ScannerWidget';

export default function ScannerScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'ocr' ? 'Scan Menu' : 'Scan QR Code'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Scanner */}
      <View style={styles.scannerWrapper}>
        <ScannerWidget />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <View style={styles.instructionDot} />
          <Text style={styles.instructionText}>
            {mode === 'ocr'
              ? 'Point your camera at a restaurant menu and tap capture'
              : 'Point your camera at a restaurant QR code'}
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionDot} />
          <Text style={styles.instructionText}>
            You can switch between QR scan and Menu scan modes
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionDot} />
          <Text style={styles.instructionText}>
            Ensure good lighting for best results
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCFF',
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181C2E',
  },
  scannerWrapper: {
    paddingHorizontal: 20,
    flex: 1,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 14,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7A00',
  },
  instructionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
});
