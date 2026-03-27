import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getVendors, DBVendor as Vendor } from '@/api/vendorApi';

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#FBFCFF',
  surface: '#FFFFFF',
  accent: '#FF7A00',
  text: '#181C2E',
  textSec: '#6B7280',
  textMuted: '#A0A5BA',
  border: '#F0F5FA',
  accentBg: 'rgba(255, 122, 0, 0.08)',
};

const { width } = Dimensions.get('window');

export default function StreetVendorsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; tag?: string; sort?: string }>();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.q || '');
  const [debouncedSearch, setDebouncedSearch] = useState(params.q || '');
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'default'>((params.sort as any) || 'default');
  const [filterTag, setFilterTag] = useState<string | null>(params.tag || null);

  // ─── Vendor Detail Modal ───
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      router.setParams({ q: search, tag: filterTag || '', sort: sortBy });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filterTag, sortBy]);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVendors(debouncedSearch || undefined);
      setVendors(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const processedVendors = useMemo(() => {
    let list = [...vendors];
    if (filterTag) {
      list = list.filter((v) => v.tags.includes(filterTag));
    }
    if (sortBy === 'score') {
      list.sort((a, b) => (b.critic_score || 0) - (a.critic_score || 0));
    } else if (sortBy === 'price') {
      const priceVal = (p?: string | null) => (p?.length || 0);
      list.sort((a, b) => priceVal(b.price_range) - priceVal(a.price_range));
    }
    return list;
  }, [vendors, sortBy, filterTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    vendors.forEach((v) => v.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).slice(0, 10);
  }, [vendors]);

  const handleOpenMap = (location: string) => {
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}`;
    Linking.openURL(mapUrl).catch((err) => console.error('Map error:', err));
  };

  const renderVendor = ({ item }: { item: Vendor }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => setSelectedVendor(item)}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=600&q=80' }}
          style={styles.cardImage}
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.price_range || '$'}</Text>
        </View>
        {item.critic_score && (
          <View style={styles.scoreBadge}>
            <Ionicons name="star" size={12} color="#FFF" />
            <Text style={styles.scoreText}>{item.critic_score.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.vendorName}>{item.name}</Text>
        </View>

        <Text style={styles.vendorDesc} numberOfLines={2}>
          {item.description || 'Discover incredible local flavors from this popular street food gem.'}
        </Text>

        <View style={styles.chipRow}>
          {item.food.slice(0, 3).map((f) => (
            <View key={f} style={styles.foodChip}>
              <Text style={styles.foodChipText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.locationText}>{item.location || 'Local Cart'}</Text>
          </View>
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 2).map((t) => (
              <Text key={t} style={styles.tagText}>#{t}</Text>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Street Vendors</Text>
          <Text style={styles.headerSub}>Real-time local food gems 🛍️</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          placeholder="Search by name or food item..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, sortBy === 'default' && styles.filterPillActive]}
            onPress={() => setSortBy('default')}
          >
            <Text style={[styles.filterText, sortBy === 'default' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, sortBy === 'score' && styles.filterPillActive]}
            onPress={() => setSortBy('score')}
          >
            <Text style={[styles.filterText, sortBy === 'score' && styles.filterTextActive]}>Top Rated</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, sortBy === 'price' && styles.filterPillActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={[styles.filterText, sortBy === 'price' && styles.filterTextActive]}>Pricey</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterPill, filterTag === tag && styles.filterPillActive]}
              onPress={() => setFilterTag(filterTag === tag ? null : tag)}
            >
              <Text style={[styles.filterText, filterTag === tag && styles.filterTextActive]}>
                {String(tag).charAt(0).toUpperCase() + String(tag).slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Fetching vendors...</Text>
        </View>
      ) : (
        <FlatList
          data={processedVendors}
          keyExtractor={(item) => item.id}
          renderItem={renderVendor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="store-off-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No vendors found</Text>
              <Text style={styles.emptySub}>Try a different search or filter</Text>
            </View>
          }
        />
      )}

      {/* ─── Vendor Detail Modal ─── */}
      <Modal
        animationType="slide"
        transparent
        visible={!!selectedVendor}
        onRequestClose={() => setSelectedVendor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVendor && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedVendor.image_url || 'https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=600&q=80' }}
                  style={styles.modalImage}
                />
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedVendor(null)}>
                  <Ionicons name="close" size={24} color="#181C2E" />
                </TouchableOpacity>

                <View style={styles.modalBody}>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalName}>{selectedVendor.name}</Text>
                    {selectedVendor.critic_score && (
                      <View style={styles.modalRating}>
                        <Ionicons name="star" size={14} color="#FFF" />
                        <Text style={styles.modalRatingText}>{selectedVendor.critic_score.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.modalDesc}>
                    {selectedVendor.description || 'Amazing local food experience awaits you.'}
                  </Text>

                  {/* Location + Map Button */}
                  {selectedVendor.location && (
                    <TouchableOpacity
                      style={styles.modalMapRow}
                      onPress={() => handleOpenMap(selectedVendor.location!)}
                    >
                      <Ionicons name="location" size={18} color={COLORS.accent} />
                      <Text style={styles.modalLocation}>{selectedVendor.location}</Text>
                      <View style={styles.modalMapBtn}>
                        <Ionicons name="navigate" size={14} color="#FFF" />
                        <Text style={styles.modalMapBtnText}>Open Map</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Price */}
                  {selectedVendor.price_range && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="pricetag-outline" size={16} color={COLORS.textSec} />
                      <Text style={styles.modalInfoText}>Price Range: {selectedVendor.price_range}</Text>
                    </View>
                  )}

                  {/* Tags */}
                  <View style={styles.modalTagsRow}>
                    {selectedVendor.tags.map((t) => (
                      <View key={t} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>#{t}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Dishes */}
                  <Text style={styles.modalSectionTitle}>Menu Items</Text>
                  <View style={styles.modalDishGrid}>
                    {selectedVendor.food.map((f, idx) => (
                      <View key={f + idx} style={styles.modalDishCard}>
                        <Ionicons name="restaurant-outline" size={16} color={COLORS.accent} />
                        <Text style={styles.modalDishName}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, height: 52, marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  searchInput: { flex: 1, marginLeft: 10, color: COLORS.text, fontSize: 15, fontWeight: '500' },

  filterRow: { paddingHorizontal: 20, gap: 10 },
  filterPill: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.textSec },
  filterTextActive: { color: '#FFF' },
  divider: { width: 1, height: 24, backgroundColor: COLORS.border, marginHorizontal: 4, alignSelf: 'center' },

  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 24, marginBottom: 20, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  imageWrap: { position: 'relative', height: 170 },
  cardImage: { width: '100%', height: '100%' },
  priceBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priceText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  scoreBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: COLORS.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  vendorName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  vendorDesc: { fontSize: 13, color: COLORS.textSec, lineHeight: 20, marginBottom: 12 },

  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  foodChip: { backgroundColor: '#F0F5FA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  foodChipText: { fontSize: 11, fontWeight: '600', color: COLORS.textSec },

  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14, justifyContent: 'space-between', alignItems: 'center' },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  tagsRow: { flexDirection: 'row', gap: 8 },
  tagText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 },
  loadingText: { marginTop: 12, color: COLORS.textMuted, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 16 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },

  // ─── Modal ───
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '85%', minHeight: '50%',
  },
  modalImage: { width: '100%', height: 200, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  modalClose: {
    position: 'absolute', top: 14, right: 14, width: 36, height: 36,
    borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  modalBody: { padding: 20, paddingBottom: 40 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalName: { fontSize: 22, fontWeight: '800', color: COLORS.text, flex: 1 },
  modalRating: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  modalRatingText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  modalDesc: { fontSize: 14, color: COLORS.textSec, lineHeight: 22, marginBottom: 16 },
  modalMapRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4E5',
    padding: 14, borderRadius: 14, marginBottom: 12, gap: 8,
  },
  modalLocation: { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '600' },
  modalMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  modalMapBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalInfoText: { fontSize: 13, color: COLORS.textSec, fontWeight: '500' },
  modalTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  modalTag: { backgroundColor: '#F0F5FA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  modalTagText: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  modalDishGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modalDishCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF4E5', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
  },
  modalDishName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
});
