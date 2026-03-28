import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AuthTheme } from "@/constants/AuthTheme";
import { CustomButton } from "@/components/auth/CustomButton";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.bgDecor} />
      <View style={styles.content}>
        {/* Logo/Branding Area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>RMS</Text>
          </View>
          <Text style={styles.appName}>Restaurant Management</Text>
          <Text style={styles.tagline}>Manage your restaurant with ease</Text>
        </View>

        {/* Illustration Area */}
        <View style={styles.illustrationContainer}>
          <View style={styles.placeholderIllustration}>
            <View style={styles.illustrationCircle} />
            <Text style={styles.illustrationEmoji}>🍽️</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <CustomButton
            label="GET STARTED"
            onPress={() => router.push("/signup" as any)}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>LOG IN</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthTheme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: AuthTheme.spacing.lg,
    paddingVertical: AuthTheme.spacing.xl,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: AuthTheme.spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AuthTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: AuthTheme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: AuthTheme.colors.white,
  },
  appName: {
    fontSize: 26,
    fontWeight: "bold",
    color: AuthTheme.colors.darkNavy,
    marginBottom: AuthTheme.spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: AuthTheme.colors.textGrey,
    textAlign: "center",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIllustration: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationCircle: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: AuthTheme.colors.primary,
    opacity: 0.08,
  },
  illustrationEmoji: {
    fontSize: 120,
  },
  buttonContainer: {
    gap: AuthTheme.spacing.md,
    marginBottom: AuthTheme.spacing.lg,
  },
  loginButton: {
    paddingVertical: AuthTheme.spacing.md,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    color: AuthTheme.colors.primary,
    fontWeight: "bold",
  },
  bgDecor: {
    position: "absolute",
    right: -80,
    top: -80,
    width: 220,
    height: 220,
    backgroundColor: AuthTheme.colors.primary,
    borderRadius: 110,
    opacity: 0.14,
  },
});
