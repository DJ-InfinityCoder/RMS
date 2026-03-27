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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StructuredMenu, Dish, Ingredient } from '@/api/llmApi';
import { getFallbackImage } from '@/api/searchApi';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Colors (Global Design System) ────────────────────────────────────────────

const C = {
  bg: '#FBFCFF',
  surface: '#FFFFFF',
  surfaceLight: '#F0F5FA',
  accent: '#FF7A00',        // Global Orange
  accentLight: '#FF9533',
  accentBg: 'rgba(255, 122, 0, 0.1)',
  text: '#181C2E',
  textSec: '#6B7280',
  textMuted: '#A0A5BA',
  border: '#F0F5FA',
  success: '#34D399',
  cardBg: '#FFFFFF',
};

// ─── Dish Card ────────────────────────────────────────────────────────────────

const DishCard = ({
  dish,
  index,
}: {
  dish: Dish;
  index: number;
}) => {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
    imgError || !dish.image_url
      ? getFallbackImage(dish.name)
      : dish.image_url;

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
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          onError={() => setImgError(true)}
        />
        <View style={styles.cardImageOverlay} />
        
        {/* Price Badge */}
        {dish.price && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>
              ₹{dish.price}
            </Text>
          </View>
        )}

        {/* Calorie Badge */}
        {dish.calories && (
          <View style={styles.calorieBadge}>
            <MaterialCommunityIcons name="fire" size={12} color="#FF9533" />
            <Text style={styles.calorieText}>{dish.calories} kcal</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{dish.name}</Text>
            {dish.cooking_method && (
              <Text style={styles.cookingMethod}>
                <MaterialCommunityIcons name="pot-steam" size={12} color={C.accent} /> {dish.cooking_method}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.expandBtn}
            onPress={() => setExpanded(!expanded)}
          >
            <Ionicons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={C.textSec} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardDesc} numberOfLines={expanded ? undefined : 2}>
          {dish.description}
        </Text>

        {expanded && dish.ingredients.length > 0 && (
          <View style={styles.ingredientSection}>
            <View style={styles.divider} />
            <Text style={styles.ingredientTitle}>Key Ingredients & Flavors</Text>
            <View style={styles.ingredientList}>
              {dish.ingredients.map((ing: any, i: number) => (
                <View key={i} style={styles.ingredientBadge}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  {ing.description && (
                    <Text style={styles.ingredientDesc}> • {ing.description}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.tagRow}>
            {dish.recommended_for?.split(',').map((tag: any, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MenuResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    menuData: string;
    processingTime: string;
  }>();

  const [searchQuery, setSearchQuery] = useState('');
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Parse menu data
  const menu: StructuredMenu = useMemo(() => {
    try {
      return JSON.parse(params.menuData ?? '{}');
    } catch {
      return { restaurantName: 'Menu', dishes: [] };
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

  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return menu.dishes;
    const q = searchQuery.toLowerCase();
    return menu.dishes.filter(
      (d: any) => 
        d.name.toLowerCase().includes(q) || 
        d.description?.toLowerCase().includes(q)
    );
  }, [menu, searchQuery]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }) }],
          },
        ]}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{menu.restaurantName || 'Menu'}</Text>
              <View style={styles.statRow}>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons name="food-variant" size={12} color={C.accent} />
                  <Text style={styles.statText}>{menu.dishes.length} Dishes</Text>
                </View>
                <View style={styles.statPill}>
                  <Ionicons name="time-outline" size={12} color={C.accent} />
                  <Text style={styles.statText}>{(processingTime / 1000).toFixed(1)}s</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/snap-menu' as any)}>
              <Ionicons name="camera-outline" size={22} color={C.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={C.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search dishes..."
                placeholderTextColor={C.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* ── List ── */}
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <DishCard dish={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-off" size={64} color={C.textMuted} />
            <Text style={styles.emptyTitle}>No dishes found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerSafe: { paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  headerTitle: { color: C.text, fontSize: 18, fontWeight: '800' },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentBg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, gap: 4 },
  statText: { color: C.accent, fontSize: 10, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  searchRow: { paddingHorizontal: 16, marginTop: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceLight, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 10 },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  listContent: { paddingBottom: 100, paddingTop: 10 },
  card: { marginHorizontal: 16, marginBottom: 20, backgroundColor: C.cardBg, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F5FA', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  imageContainer: { width: '100%', height: 200, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  priceBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: C.accent, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  priceBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  calorieBadge: { position: 'absolute', bottom: 12, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  calorieText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardName: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 2 },
  cookingMethod: { color: C.accent, fontSize: 12, fontWeight: '600' },
  expandBtn: { padding: 4 },
  cardDesc: { color: C.textSec, fontSize: 13, lineHeight: 20 },
  ingredientSection: { marginTop: 16 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 12 },
  ingredientTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  ingredientList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientBadge: { backgroundColor: C.surfaceLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' },
  ingredientName: { color: C.text, fontSize: 12, fontWeight: '600' },
  ingredientDesc: { color: C.textSec, fontSize: 11 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  tagRow: { flexDirection: 'row', flex: 1, flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#F0F5FA', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: C.textSec, fontSize: 10, fontWeight: '600' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyTitle: { color: C.textSec, fontSize: 16, fontWeight: '600', marginTop: 16 },
});
