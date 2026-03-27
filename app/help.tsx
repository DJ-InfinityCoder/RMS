import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FAQ_DATA = [
  {
    category: 'Orders',
    items: [
      { q: 'How do I place an order?', a: 'Browse restaurants from the Home tab, select dishes and add them to your cart. Then go to Cart, select a pickup time, and place your order.' },
      { q: 'Can I cancel my order?', a: 'You can cancel an order within 5 minutes of placing it. After that, contact the restaurant directly for cancellation.' },
      { q: 'How do I track my order?', a: 'Go to the Orders tab to see real-time status updates for all your orders.' },
      { q: 'Can I order from multiple restaurants?', a: 'Yes! You can add items from different restaurants to your cart. Each restaurant order will be processed separately.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, and cash payments (subject to loyalty points requirement).' },
      { q: 'Why can\'t I pay with cash?', a: 'Cash payment requires a minimum of 100 loyalty points. Keep ordering to earn more points!' },
      { q: 'How do refunds work?', a: 'Refunds are processed within 5-7 business days to your original payment method.' },
    ],
  },
  {
    category: 'Account',
    items: [
      { q: 'How do I update my profile?', a: 'Go to Profile → Edit Profile to update your name, phone, address, and dietary preferences.' },
      { q: 'How do loyalty points work?', a: 'You earn 1 point per ₹10 spent. Points unlock cash payment and can be redeemed for discounts.' },
      { q: 'How do I delete my account?', a: 'Contact support@rmsapp.com with your registered email to request account deletion.' },
    ],
  },
  {
    category: 'Menu Scanning',
    items: [
      { q: 'How does Snap Menu work?', a: 'Take a photo of any physical menu. Our AI extracts the text, structures it, and shows you dish details with images.' },
      { q: 'What about QR scanning?', a: 'Scan a restaurant\'s QR code to instantly view their digital menu with prices and availability.' },
    ],
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Find answers to common questions</Text>

        {FAQ_DATA.map((section) => (
          <View key={section.category}>
            <Text style={styles.categoryTitle}>{section.category}</Text>
            <View style={styles.section}>
              {section.items.map((faq, idx) => {
                const key = `${section.category}-${idx}`;
                const isOpen = expanded === key;
                return (
                  <View key={key}>
                    <TouchableOpacity style={styles.faqRow} onPress={() => toggle(key)}>
                      <Text style={styles.question}>{faq.q}</Text>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#A0A5BA" />
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={styles.answerWrap}>
                        <Text style={styles.answer}>{faq.a}</Text>
                      </View>
                    )}
                    {idx < section.items.length - 1 && <View style={styles.separator} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={24} color="#FF7A00" />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSub}>Email us at support@rmsapp.com</Text>
          </View>
        </View>
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
  subtitle: { fontSize: 14, color: '#A0A5BA', marginBottom: 20 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: '#181C2E', marginTop: 20, marginBottom: 8 },
  section: { backgroundColor: '#FFF', borderRadius: 18, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  question: { fontSize: 14, fontWeight: '600', color: '#181C2E', flex: 1, marginRight: 8 },
  answerWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  answer: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  separator: { height: 1, backgroundColor: '#F0F5FA', marginLeft: 16 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF4E5',
    padding: 20, borderRadius: 18, marginTop: 30,
  },
  contactTitle: { fontSize: 15, fontWeight: '700', color: '#181C2E' },
  contactSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});
