import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useUserLocation from "@/hooks/useUserLocation";
import { restaurants, getAllCategories } from "@/data/restaurants";


const QUICK_CATEGORIES = [
  { id: "1", name: "All", icon: "fire" },
  { id: "7", name: "Vendors", icon: "store" },
  { id: "2", name: "Pizza", icon: "pizza" },
  { id: "3", name: "Burger", icon: "hamburger" },
  { id: "4", name: "Indian", icon: "food-variant" },
  { id: "5", name: "Pasta", icon: "pasta" },
  { id: "6", name: "Dessert", icon: "cupcake" },
];

export default function HomeScreen() {
  const region = useUserLocation();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ─── Time-based Greeting ───────────────────────────────────────────────────
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  }, []);

  // ─── Category filter ───────────────────────────────────────────────────────
  const filteredRestaurants = useMemo(() => {
    if (!region) return [];
    const delta = 0.05;
    const nearby = restaurants.filter(
      (res) =>
        Math.abs(res.latitude - region.latitude) < delta &&
        Math.abs(res.longitude - region.longitude) < delta,
    );

    if (selectedCategory === "All") return nearby;

    return nearby.filter(
      (res) =>
        res.cuisine.some((c) =>
          c.toLowerCase().includes(selectedCategory.toLowerCase()),
        ) ||
        res.menuItems.some((m) =>
          m.category.toLowerCase().includes(selectedCategory.toLowerCase()),
        ),
    );
  }, [region, selectedCategory]);

  const renderCategory = ({ item }: { item: (typeof QUICK_CATEGORIES)[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.name && styles.categoryCardActive,
      ]}
      onPress={() => {
        if (item.name === "Vendors") {
          router.push("/vendors" as any);
        } else {
          setSelectedCategory(item.name);
        }
      }}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={22}
        color={selectedCategory === item.name ? "#FFF" : "#FF7A00"}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.name && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderRestaurant = ({ item }: { item: (typeof restaurants)[0] }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => router.push(`/restaurant/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.resImage} />
      <View style={styles.resInfo}>
        <Text style={styles.resName}>{item.name}</Text>
        <Text style={styles.resCuisine}>{item.cuisine.join(" • ")}</Text>
        <View style={styles.resMetaRow}>
          <View style={styles.resMetaItem}>
            <Ionicons name="star" size={14} color="#FF7A00" />
            <Text style={styles.resMetaText}>{item.rating}</Text>
          </View>
          <View style={styles.resMetaDot} />
          <View style={styles.resMetaItem}>
            <Ionicons name="time-outline" size={14} color="#A0A5BA" />
            <Text style={styles.resMetaText}>{item.deliveryTime}</Text>
          </View>
          <View style={styles.resMetaDot} />
          <View style={styles.resMetaItem}>
            <Ionicons name="restaurant-outline" size={14} color="#A0A5BA" />
            <Text style={styles.resMetaText}>
              {item.menuItems.length} items
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Finding restaurants near you...</Text>
      </View>
    );
  }

  const delta = 0.05;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Clean Minimal Header ──────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingSmall}>Hey Bharat,</Text>
            <Text style={styles.greetingBold}>{greeting}! 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/settings" as any)}
          >
            <Ionicons name="settings-outline" size={22} color="#181C2E" />
          </TouchableOpacity>
        </View>

        {/* ─── Search Bar ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/search" as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={20} color="#A0A5BA" />
          <Text style={styles.searchPlaceholder}>
            Search dishes, restaurants, cuisines...
          </Text>
        </TouchableOpacity>

        {/* ─── Scan Buttons ──────────────────────────────────────────────── */}
        <View style={styles.scanRow}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push("/scanner?mode=qr" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.scanIconWrap}>
              <Ionicons name="qr-code-outline" size={24} color="#FFF" />
            </View>
            <View>
              <Text style={styles.scanTitle}>Scan QR</Text>
              <Text style={styles.scanSub}>Restaurant code</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scanButton, styles.scanButtonAlt]}
            onPress={() => router.push("/snap-menu" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.scanIconWrapAlt}>
              <MaterialCommunityIcons
                name="text-recognition"
                size={24}
                color="#FFF"
              />
            </View>
            <View>
              <Text style={styles.scanTitle}>Scan Menu</Text>
              <Text style={styles.scanSub}>OCR capture</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Categories ────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => setSelectedCategory("All")}>
            <Text style={styles.seeAll}>
              {selectedCategory !== "All" ? "Clear Filter" : "See All >"}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoryList}
        />

        {/* ─── Restaurants ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "All"
              ? "Open Restaurants"
              : `"${selectedCategory}" Restaurants`}
          </Text>
          <Text style={styles.countBadge}>{filteredRestaurants.length}</Text>
        </View>

        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="store-off-outline"
                size={48}
                color="#D0D5DD"
              />
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory !== "All"
                  ? `No restaurants serve "${selectedCategory}" near you`
                  : "No restaurants nearby"}
              </Text>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFCFF",
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFCFF",
  },
  loadingText: {
    marginTop: 14,
    color: "#A0A5BA",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Header ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  greetingSmall: {
    fontSize: 14,
    color: "#A0A5BA",
    fontWeight: "500",
  },
  greetingBold: {
    fontSize: 22,
    fontWeight: "700",
    color: "#181C2E",
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F5FA",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Search ──
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#F0F5FA",
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    alignItems: "center",
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: "#A0A5BA",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Scan Buttons ──
  scanRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  scanButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    elevation: 4,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#FFF4E5",
  },
  scanButtonAlt: {
    shadowColor: "#181C2E",
    borderColor: "#F0F5FA",
  },
  scanIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
  },
  scanIconWrapAlt: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#181C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  scanTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#181C2E",
  },
  scanSub: {
    fontSize: 11,
    color: "#A0A5BA",
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Section ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 26,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
  },
  seeAll: {
    color: "#FF7A00",
    fontWeight: "600",
    fontSize: 13,
  },
  countBadge: {
    backgroundColor: "#FF7A00",
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: "hidden",
  },

  // ── Categories ──
  categoryList: {
    paddingVertical: 14,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F5FA",
  },
  categoryCardActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
    elevation: 5,
    shadowColor: "#FF7A00",
    shadowOpacity: 0.25,
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 13,
    color: "#181C2E",
  },
  categoryTextActive: {
    color: "#FFF",
  },

  // ── Restaurant Cards ──
  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  resImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F0F5FA",
  },
  resInfo: {
    padding: 16,
  },
  resName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181C2E",
    marginBottom: 4,
  },
  resCuisine: {
    fontSize: 12,
    color: "#A0A5BA",
    fontWeight: "500",
    marginBottom: 10,
  },
  resMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  resMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0D5DD",
    marginHorizontal: 8,
  },
  resMetaText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ── Map ──
  mapContainer: {
    height: 200,
    marginVertical: 15,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  // ── Empty ──
  emptyState: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#181C2E",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#A0A5BA",
    marginTop: 4,
    textAlign: "center",
  },
});
