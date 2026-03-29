import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "@/components/auth/CustomButton";
import { CustomTextInput } from "@/components/auth/CustomTextInput";
import { AuthTheme } from "@/constants/AuthTheme";
import * as Location from "expo-location";
import * as SecureStore from 'expo-secure-store';

export default function VendorProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    critic_score: "",
    food: "",
    tags: "",
    price_range: "",
    location: "",
    image_url: "",
  });

  useEffect(() => {
    const fetchExisting = async () => {
      const name = await SecureStore.getItemAsync('vendorName');
      if (!name) return;
      
      setFormData(prev => ({ ...prev, name }));
      setLoading(true);
      try {
        const res = await fetch(`/api/vendor/profile?name=${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              ...data,
              critic_score: data.critic_score?.toString() || "",
              food: data.food?.join(", ") || "",
              tags: data.tags?.join(", ") || "",
              image_url: data.image_url || "",
              description: data.description || "",
              location: data.location || "",
              price_range: data.price_range || "",
            });
          }
        }
      } catch (err) { 
        console.error('Error fetching profile:', err); 
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, []);

  const requestLocation = async () => {
    setLocLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location access in settings",
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const { city, region, street, streetNumber } = results[0];
        const addressString =
          `${streetNumber || ""} ${street || ""}, ${city || ""}, ${region || ""}`
            .trim()
            .replace(/^,/, "")
            .trim();
        setFormData({
          ...formData,
          location: addressString || `${latitude}, ${longitude}`,
        });
      } else {
        setFormData({ ...formData, location: `${latitude}, ${longitude}` });
      }
      Alert.alert("Success", "Business location updated!");
    } catch (error) {
      Alert.alert("Error", "Could not fetch location automatically.");
    } finally {
      setLocLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Required Field", "Vendor Name is mandatory");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/vendor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          food: formData.food
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          tags: formData.tags
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      Alert.alert("Profile Saved", "Your business details have been updated.", [
        { text: "Great", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Configuration</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
             <View style={{ padding: 40 }}><ActivityIndicator size="large" color={AuthTheme.colors.primary} /></View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.groupLabel}>General Information</Text>
              <CustomTextInput
                label="Business Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g. Taste of India"
                leftIcon={
                  <Ionicons name="storefront-outline" size={20} color="#666" />
                }
              />

              <CustomTextInput
                label="About the Vendor"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Short description of your services..."
                multiline
                numberOfLines={4}
                leftIcon={
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#666"
                  />
                }
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <CustomTextInput
                    label="Price Category"
                    value={formData.price_range}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price_range: text })
                    }
                    placeholder="Budget/Mid/High"
                    leftIcon={
                      <Ionicons name="pricetag-outline" size={20} color="#666" />
                    }
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <CustomTextInput
                    label="Critic Score"
                    value={formData.critic_score}
                    onChangeText={(text) =>
                      setFormData({ ...formData, critic_score: text })
                    }
                    placeholder="0 - 5.0"
                    keyboardType="numeric"
                    leftIcon={
                      <Ionicons name="star-half-outline" size={20} color="#666" />
                    }
                  />
                </View>
              </View>

              <Text style={[styles.groupLabel, { marginTop: 10 }]}>
                Operations & Location
              </Text>
              <View style={styles.locationFieldWrapper}>
              <View style={{ flex: 1 }}>

                  <CustomTextInput
                    label="Physical Address"
                    value={formData.location}
                    onChangeText={(text) =>
                      setFormData({ ...formData, location: text })
                    }
                    placeholder="Where are you located?"
                    leftIcon={
                      <Ionicons name="location-outline" size={20} color="#666" />
                    }
                  />
                </View>
                <TouchableOpacity

                  style={styles.detectBtn}
                  onPress={requestLocation}
                  disabled={locLoading}
                >
                  {locLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={AuthTheme.colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name="location"
                      size={24}
                      color={AuthTheme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <CustomTextInput
                label="Specialties (comma separated)"
                value={formData.food}
                onChangeText={(text) => setFormData({ ...formData, food: text })}
                placeholder="e.g. Catering, Fast Food, Snacks"
                leftIcon={
                  <Ionicons name="fast-food-outline" size={20} color="#666" />
                }
              />

              <CustomTextInput
                label="Search Tags"
                value={formData.tags}
                onChangeText={(text) => setFormData({ ...formData, tags: text })}
                placeholder="e.g. open-24h, delivery"
                leftIcon={
                  <Ionicons name="search-outline" size={20} color="#666" />
                }
              />

              <CustomTextInput
                label="Storefront Image URL"
                value={formData.image_url}
                onChangeText={(text) =>
                  setFormData({ ...formData, image_url: text })
                }
                placeholder="https://..."
                leftIcon={
                  <Ionicons name="image-outline" size={20} color="#666" />
                }
              />
            </View>
          )}

          {!loading && (
            <View style={styles.buttonContainer}>
              <CustomButton
                label="CONFIRM CHANGES"
                onPress={handleSave}
                loading={loading}
              />
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: "#FFF",
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: AuthTheme.colors.primary,
    marginBottom: 15,
    backgroundColor: AuthTheme.colors.primary + "10",
    padding: 8,
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  locationFieldWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  detectBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AuthTheme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
