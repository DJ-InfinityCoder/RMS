import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { setSelectedRestaurant } from '@/lib/selectedRestaurant';
import MapView, { Marker } from "react-native-maps";
import useUserLocation from "../hooks/useUserLocation";
import { restaurants } from "../data/restaurants";
import { ScannerWidget } from "../components/ScannerWidget";

const CATEGORIES = [
  { id: "1", name: "All", icon: "fire" },
  { id: "2", name: "Hot Dog", icon: "food-hot-dog" },
  { id: "3", name: "Burger", icon: "hamburger" },
  { id: "4", name: "Pizza", icon: "pizza" },
];

export default function HomeScreen() {
  const region = useUserLocation(); // custom hook returning { latitude, longitude }
  const router = useRouter();

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <MaterialCommunityIcons name={item.icon as any} size={24} color="#FF7A00" />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRestaurant = ({ item }: { item: typeof restaurants[0] }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => {
        setSelectedRestaurant(item.id);
        router.push('/restaurant' as any);
      }}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.resImage} />
      <View style={styles.resInfo}>
        <Text style={styles.resName}>{item.name}</Text>
        <Text style={styles.resTags}>⭐ {item.rating} • ⏰ {item.deliveryTime}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!region) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  // Set delta values for zoom (~0.05 = ~5km radius)
  const delta = 0.05;

  // Filter nearby restaurants (within ~5km)
  const nearbyRestaurants = restaurants.filter(
    (res) =>
      Math.abs(res.latitude - region.latitude) < delta &&
      Math.abs(res.longitude - region.longitude) < delta
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu-outline" size={28} color="black" />
          </TouchableOpacity>
          <View style={styles.addressContainer}>
            <Text style={styles.deliverTo}>DELIVER TO</Text>
            <Text style={styles.address}>{region.latitude.toFixed(4)}, {region.longitude.toFixed(4)} ▾</Text>
          </View>
          <View style={styles.cartBadge}>
            <Ionicons name="bag-handle-outline" size={24} color="white" />
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </View>
        </View>

        <Text style={styles.welcomeText}>
          Hey Bharat, <Text style={{ fontWeight: "bold" }}>Good Afternoon!</Text>
        </Text>

        <ScannerWidget />

        {/* Search Bar (opens Search screen) */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search' as any)} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={20} color="#676767" />
          <Text style={styles.searchInput}>Search dishes, restaurants</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All {'>'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoryList}
        />

        {/* Map showing nearby restaurants */}
        <View style={{ height: 200, marginVertical: 15, borderRadius: 15, overflow: "hidden" }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: delta,
              longitudeDelta: delta * (Dimensions.get("window").width / Dimensions.get("window").height),
            }}
            showsUserLocation
          >
            {nearbyRestaurants.map((res) => (
              <Marker
                key={res.id}
                coordinate={{
                  latitude: res.latitude,
                  longitude: res.longitude,
                }}
                title={res.name}
                description={`⭐ ${res.rating}`}
              />
            ))}
          </MapView>
        </View>

        {/* Open Restaurants */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Restaurants</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All {'>'}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={nearbyRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFCFF", paddingHorizontal: 20, paddingTop: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  menuButton: { backgroundColor: "#F6F6F6", padding: 8, borderRadius: 50 },
  addressContainer: { alignItems: "center" },
  deliverTo: { color: "#FF7A00", fontSize: 12, fontWeight: "bold" },
  address: { fontSize: 14, color: "#32343E" },
  cartBadge: { backgroundColor: "#181C2E", padding: 10, borderRadius: 50 },
  badgeCount: { position: "absolute", top: -2, right: -2, backgroundColor: "#FF7A00", borderRadius: 10, width: 18, height: 18, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  welcomeText: { fontSize: 18, marginTop: 20, color: "#32343E" },
  searchBar: { flexDirection: "row", backgroundColor: "#F6F6F6", borderRadius: 15, padding: 15, marginTop: 20, alignItems: "center" },
  searchInput: { marginLeft: 10, flex: 1, color: '#666' },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 25, alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  seeAll: { color: "#32343E", opacity: 0.7 },
  categoryList: { paddingVertical: 15 },
  categoryCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 10, borderRadius: 30, marginRight: 15, elevation: 2 },
  categoryText: { marginLeft: 8, fontWeight: "600" },
  restaurantCard: { backgroundColor: "white", borderRadius: 20, overflow: "hidden", marginBottom: 20, elevation: 3 },
  resImage: { width: "100%", height: 160 },
  resInfo: { padding: 15 },
  resName: { fontSize: 18, fontWeight: "bold" },
  resTags: { color: "#A0A5BA", marginVertical: 5 },
  mapBtn: { backgroundColor: "#ff6a00", padding: 16, borderRadius: 12, alignItems: "center", marginVertical: 20 },
  mapBtnText: { color: "#fff", fontWeight: "bold" },
});
