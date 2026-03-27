/**
 * Menu Result Screen
 *
 * Displays the structured menu extracted from the camera scan.
 * Features:
 *  - Section-wise layout with collapsible headers
 *  - Premium card design with food images
 *  - Smooth entry animations
 *  - Add-to-cart functionality
 *  - Search/filter support
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  TextInput,
  ScrollView,
  SectionList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StructuredMenu, MenuSection, MenuItem } from '@/api/llmApi';
import { getFallbackImage } from '@/api/searchApi';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 40;

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  bg: '#0A0A0F',
  surface: '#14141F',
  surfaceLight: '#1C1C2E',
  accent: '#7C5CFC',
  accentLight: '#9B82FC',
  accentBg: 'rgba(124,92,252,0.1)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.08)',
  success: '#34D399',
  orange: '#FF7A00',
  cardBg: '#181825',
};

// ─── Section Colors ───────────────────────────────────────────────────────────

const SECTION_COLORS = [
  { bg: 'rgba(124,92,252,0.12)', text: '#9B82FC', border: 'rgba(124,92,252,0.25)' },
  { bg: 'rgba(52,211,153,0.12)', text: '#34D399', border: 'rgba(52,211,153,0.25)' },
  { bg: 'rgba(251,146,60,0.12)', text: '#FB923C', border: 'rgba(251,146,60,0.25)' },
  { bg: 'rgba(96,165,250,0.12)', text: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
  { bg: 'rgba(244,114,182,0.12)', text: '#F472B6', border: 'rgba(244,114,182,0.25)' },
  { bg: 'rgba(167,139,250,0.12)', text: '#A78BFA', border: 'rgba(167,139,250,0.25)' },
];

// ─── Item Card ────────────────────────────────────────────────────────────────

const MenuItemCard = ({
  item,
  index,
  sectionColor,
}: {
  item: MenuItem & { imageUrl?: string };
  index: number;
  sectionColor: typeof SECTION_COLORS[0];
}) => {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const imageUrl =
    imgError || !(item as any).imageUrl
      ? getFallbackImage(item.name)
      : (item as any).imageUrl;

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Image */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.cardImage}
        onError={() => setImgError(true)}
      />

      {/* Gradient over image */}
      <View style={styles.cardImageOverlay} />

      {/* Price badge */}
      <View style={[styles.priceBadge, { backgroundColor: sectionColor.bg, borderColor: sectionColor.border }]}>
        <Text style={[styles.priceBadgeText, { color: sectionColor.text }]}>
          {item.price}
        </Text>
      </View>

      {/* Card body */}
      <View style={styles.cardBody}>
        <View style={styles.cardTextArea}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* Add button */}
        <TouchableOpacity
          style={[styles.addBtn, added && styles.addBtnActive]}
          onPress={handleAdd}
          activeOpacity={0.75}
        >
          {added ? (
            <Ionicons name="checkmark" size={20} color="#FFF" />
          ) : (
            <Ionicons name="add" size={22} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  title,
  count,
  color,
}: {
  title: string;
  count: number;
  color: typeof SECTION_COLORS[0];
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionDot, { backgroundColor: color.text }]} />
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={[styles.sectionCountPill, { backgroundColor: color.bg, borderColor: color.border }]}>
      <Text style={[styles.sectionCountText, { color: color.text }]}>
        {count}
      </Text>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MenuResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    menuData: string;
    processingTime: string;
  }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Parse menu data
  const menu: StructuredMenu = useMemo(() => {
    try {
      return JSON.parse(params.menuData ?? '{}');
    } catch {
      return { restaurantName: 'Menu', sections: [] };
    }
  }, [params.menuData]);

  const processingTime = parseInt(params.processingTime ?? '0', 10);

  // Header entry animation
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter items based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeSection
        ? menu.sections.filter((s) => s.title === activeSection)
        : menu.sections;
    }

    const q = searchQuery.toLowerCase();
    return menu.sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [menu, searchQuery, activeSection]);

  const totalItems = menu.sections.reduce(
    (sum, s) => sum + s.items.length,
    0
  );

  // Build section list data
  const sectionListData = filteredSections.map((section, idx) => ({
    title: section.title,
    color: SECTION_COLORS[idx % SECTION_COLORS.length],
    data: section.items,
  }));

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.bg}
        translucent={false}
      />

      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          {/* Top row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {menu.restaurantName || 'Scanned Menu'}
              </Text>
              <View style={styles.statRow}>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons
                    name="food-variant"
                    size={12}
                    color={C.accent}
                  />
                  <Text style={styles.statText}>
                    {totalItems} item{totalItems !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.statPill}>
                  <Ionicons name="time-outline" size={12} color={C.accent} />
                  <Text style={styles.statText}>
                    {(processingTime / 1000).toFixed(1)}s
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push('/snap-menu' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="scan" size={20} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={C.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items..."
                placeholderTextColor={C.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={C.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Section filter chips */}
          {menu.sections.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              <TouchableOpacity
                style={[
                  styles.chip,
                  !activeSection && styles.chipActive,
                ]}
                onPress={() => setActiveSection(null)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    !activeSection && styles.chipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {menu.sections.map((section, idx) => {
                const isActive = activeSection === section.title;
                const color = SECTION_COLORS[idx % SECTION_COLORS.length];
                return (
                  <TouchableOpacity
                    key={section.title}
                    style={[
                      styles.chip,
                      isActive && {
                        backgroundColor: color.bg,
                        borderColor: color.border,
                      },
                    ]}
                    onPress={() =>
                      setActiveSection(isActive ? null : section.title)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && { color: color.text },
                      ]}
                    >
                      {section.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Animated.View>

      {/* ── Menu Items ── */}
      <SectionList
        sections={sectionListData}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <SectionHeader
            title={section.title}
            count={section.data.length}
            color={section.color}
          />
        )}
        renderItem={({ item, index, section }) => (
          <MenuItemCard
            item={item as MenuItem & { imageUrl?: string }}
            index={index}
            sectionColor={section.color}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="food-off"
              size={64}
              color={C.textMuted}
            />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'No menu items were detected'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ──
  header: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerSafe: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accentBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  statText: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Search ──
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    fontWeight: '500',
  },

  // ── Chips ──
  chipScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: C.accentBg,
    borderColor: 'rgba(124,92,252,0.3)',
  },
  chipText: {
    color: C.textSec,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: C.accent,
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 14,
    gap: 10,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  sectionCountPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Card ──
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: C.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: C.surfaceLight,
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  priceBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  priceBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cardTextArea: {
    flex: 1,
  },
  cardName: {
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardDesc: {
    color: C.textSec,
    fontSize: 12,
    lineHeight: 18,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: {
    backgroundColor: C.success,
  },

  // ── List ──
  listContent: {
    paddingBottom: 80,
  },

  // ── Empty ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: C.textSec,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
