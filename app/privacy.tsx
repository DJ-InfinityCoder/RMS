import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: March 28, 2026</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide directly, including: name, email, phone number, delivery
          address (with latitude and longitude for map features), dietary preferences, and payment
          information. We also collect usage data and device information automatically.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          Your information is used to: process orders, personalize your experience, provide location-based
          restaurant recommendations, send order notifications, and improve our services. We never sell your
          personal data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>3. Location Data</Text>
        <Text style={styles.body}>
          We collect your location (GPS coordinates) with your permission to show nearby restaurants and
          vendors, provide delivery estimates, and enable map navigation features. You can disable location
          access at any time in your device settings.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.body}>
          We use industry-standard encryption (SSL/TLS) to protect your data in transit and at rest.
          Authentication tokens are stored securely using platform-specific secure storage (Keychain on iOS,
          Keystore on Android).
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.body}>
          We use trusted third-party services for: payment processing, push notifications, analytics, and
          cloud storage. Each service has its own privacy policy governing data handling.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.body}>
          You have the right to: access your data, request corrections, delete your account, export your
          data, and opt out of marketing communications. Contact support@rmsapp.com for any data requests.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.body}>
          For privacy-related inquiries, please contact our Data Protection Officer at privacy@rmsapp.com.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F5FA', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#181C2E' },
  scroll: { padding: 20, paddingBottom: 60 },
  updated: { fontSize: 12, color: '#A0A5BA', marginBottom: 20, fontStyle: 'italic' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#181C2E', marginTop: 20, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22, color: '#6B7280' },
});
