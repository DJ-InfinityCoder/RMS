import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: March 28, 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.body}>
          By accessing and using the RMS (Restaurant Management System) mobile application, you agree to be
          bound by these Terms and Conditions. If you do not agree, please do not use the app.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Service</Text>
        <Text style={styles.body}>
          The RMS app provides restaurant discovery, menu scanning, food ordering, and vendor discovery
          services. You must be at least 13 years old to use this service. Users agree to provide accurate
          information and maintain the security of their accounts.
        </Text>

        <Text style={styles.sectionTitle}>3. Orders & Payments</Text>
        <Text style={styles.body}>
          All orders placed through the app are subject to restaurant availability. Prices shown are set by
          individual restaurants and may vary. Payment processing is handled securely through our payment
          partners. Refunds are subject to restaurant and payment partner policies.
        </Text>

        <Text style={styles.sectionTitle}>4. User Content</Text>
        <Text style={styles.body}>
          By submitting reviews, ratings, or other content, you grant RMS a non-exclusive license to use,
          display, and distribute said content within the platform. Content must not be offensive, fraudulent,
          or violate any laws.
        </Text>

        <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
        <Text style={styles.body}>
          RMS acts as an intermediary between users and restaurants. We are not responsible for food quality,
          delivery issues, or restaurant-specific policies. Our liability is limited to the maximum extent
          permitted by applicable law.
        </Text>

        <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
        <Text style={styles.body}>
          We reserve the right to modify these terms at any time. Continued use of the app after changes
          constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact</Text>
        <Text style={styles.body}>
          For questions regarding these terms, please contact us at support@rmsapp.com.
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
