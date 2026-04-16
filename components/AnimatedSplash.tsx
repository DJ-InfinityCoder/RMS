import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashProps {
  onFinish: () => void;
}

/**
 * AnimatedSplash - Premium restaurant-themed splash screen
 *
 * Animation sequence:
 * 1. Background gradient fades in
 * 2. Decorative circles draw in from edges
 * 3. Logo container scales up with spring bounce
 * 4. Logo image fades in with slight upward motion
 * 5. App name types in letter by letter
 * 6. Tagline slides up and fades in
 * 7. Food emoji decorations float in from sides
 * 8. Everything fades out smoothly
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  // ─── Animation Values ──────────────────────────────────────────────
  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(30);

  const circleScale1 = useSharedValue(0);
  const circleScale2 = useSharedValue(0);
  const circleScale3 = useSharedValue(0);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);

  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(15);

  const plateRotation = useSharedValue(-30);
  const plateScale = useSharedValue(0);

  // Food emoji decorations
  const food1Translate = useSharedValue(-100);
  const food1Opacity = useSharedValue(0);
  const food2Translate = useSharedValue(100);
  const food2Opacity = useSharedValue(0);
  const food3Translate = useSharedValue(-80);
  const food3Opacity = useSharedValue(0);
  const food4Translate = useSharedValue(80);
  const food4Opacity = useSharedValue(0);

  // Shimmer line
  const shimmerTranslate = useSharedValue(-width);

  // Exit animation
  const exitOpacity = useSharedValue(1);
  const exitScale = useSharedValue(1);

  useEffect(() => {
    // Phase 1: Background fade in (0ms)
    bgOpacity.value = withTiming(1, { duration: 400, easing: Easing.ease });

    // Phase 2: Decorative circles expand (200ms)
    circleScale1.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 80 }),
    );
    circleScale2.value = withDelay(
      350,
      withSpring(1, { damping: 14, stiffness: 70 }),
    );
    circleScale3.value = withDelay(
      500,
      withSpring(1, { damping: 16, stiffness: 60 }),
    );

    // Phase 3: Logo appears with spring bounce (400ms)
    logoScale.value = withDelay(
      400,
      withSpring(1, { damping: 10, stiffness: 100 }),
    );
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    logoTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));

    // Phase 3b: Plate decoration (500ms)
    plateScale.value = withDelay(
      500,
      withSpring(1, { damping: 8, stiffness: 90 }),
    );
    plateRotation.value = withDelay(
      500,
      withSpring(0, { damping: 10, stiffness: 80 }),
    );

    // Phase 4: Title appears (800ms)
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
    titleTranslateY.value = withDelay(800, withSpring(0, { damping: 12 }));

    // Phase 5: Tagline appears (1100ms)
    taglineOpacity.value = withDelay(1100, withTiming(1, { duration: 400 }));
    taglineTranslateY.value = withDelay(1100, withSpring(0, { damping: 12 }));

    // Phase 6: Food emojis float in (1000ms staggered)
    food1Opacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    food1Translate.value = withDelay(1000, withSpring(0, { damping: 14 }));

    food2Opacity.value = withDelay(1150, withTiming(1, { duration: 500 }));
    food2Translate.value = withDelay(1150, withSpring(0, { damping: 14 }));

    food3Opacity.value = withDelay(1300, withTiming(1, { duration: 500 }));
    food3Translate.value = withDelay(1300, withSpring(0, { damping: 14 }));

    food4Opacity.value = withDelay(1450, withTiming(1, { duration: 500 }));
    food4Translate.value = withDelay(1450, withSpring(0, { damping: 14 }));

    // Phase 7: Shimmer effect across logo (1400ms)
    shimmerTranslate.value = withDelay(
      1400,
      withTiming(width * 2, { duration: 800, easing: Easing.ease }),
    );

    // Phase 8: Exit animation (2200ms)
    exitOpacity.value = withDelay(
      2200,
      withTiming(0, { duration: 400, easing: Easing.ease }),
    );
    exitScale.value = withDelay(2200, withTiming(1.1, { duration: 400 }));

    // Trigger onFinish after all animations complete
    const timeout = setTimeout(() => {
      onFinish();
    }, 2700);

    return () => clearTimeout(timeout);
  }, []);

  // ─── Animated Styles ───────────────────────────────────────────────
  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value * exitOpacity.value,
    transform: [{ scale: exitScale.value }],
  }));

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale1.value }],
    opacity: interpolate(circleScale1.value, [0, 0.5, 1], [0, 0.3, 0.08]),
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale2.value }],
    opacity: interpolate(circleScale2.value, [0, 0.5, 1], [0, 0.3, 0.06]),
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale3.value }],
    opacity: interpolate(circleScale3.value, [0, 0.5, 1], [0, 0.2, 0.04]),
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
    opacity: logoOpacity.value,
  }));

  const plateStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: plateScale.value },
      { rotate: `${plateRotation.value}deg` },
    ],
    opacity: interpolate(plateScale.value, [0, 1], [0, 1]),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const food1Style = useAnimatedStyle(() => ({
    opacity: food1Opacity.value,
    transform: [{ translateX: food1Translate.value }],
  }));

  const food2Style = useAnimatedStyle(() => ({
    opacity: food2Opacity.value,
    transform: [{ translateX: food2Translate.value }],
  }));

  const food3Style = useAnimatedStyle(() => ({
    opacity: food3Opacity.value,
    transform: [{ translateX: food3Translate.value }],
  }));

  const food4Style = useAnimatedStyle(() => ({
    opacity: food4Opacity.value,
    transform: [{ translateX: food4Translate.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      {/* ─── Decorative Background Circles ─────────────────────────── */}
      <Animated.View style={[styles.circle1, circle1Style]} />
      <Animated.View style={[styles.circle2, circle2Style]} />
      <Animated.View style={[styles.circle3, circle3Style]} />

      {/* ─── Floating Food Emojis ──────────────────────────────────── */}
      <Animated.Text style={[styles.foodEmoji, styles.food1, food1Style]}>
        🍕
      </Animated.Text>
      <Animated.Text style={[styles.foodEmoji, styles.food2, food2Style]}>
        🍔
      </Animated.Text>
      <Animated.Text style={[styles.foodEmoji, styles.food3, food3Style]}>
        🍜
      </Animated.Text>
      <Animated.Text style={[styles.foodEmoji, styles.food4, food4Style]}>
        🍰
      </Animated.Text>

      {/* ─── Center Content ────────────────────────────────────────── */}
      <View style={styles.centerContent}>
        {/* Plate decoration behind logo */}
        <Animated.View style={[styles.plateDecor, plateStyle]}>
          <View style={styles.plateInner} />
          <View style={styles.plateRim} />
        </Animated.View>

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <Image
            source={require("@/assets/images/app_logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {/* Shimmer overlay */}
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>

        {/* App Title */}
        <Animated.Text style={[styles.title, titleStyle]}>RMS</Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Restaurant Management System
        </Animated.Text>

        {/* Decorative line */}
        <Animated.View style={[styles.decorLine, taglineStyle]} />
      </View>

      {/* ─── Bottom Branding ───────────────────────────────────────── */}
      <Animated.View style={[styles.bottomContent, taglineStyle]}>
        <Text style={styles.bottomText}>Powered by RMS</Text>
        <View style={styles.dotRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  // ── Decorative Circles ──
  circle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#FF7A28",
    top: -100,
    right: -100,
  },
  circle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#FF7A28",
    bottom: -80,
    left: -80,
  },
  circle3: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FF9A54",
    top: height * 0.3,
    left: -60,
  },

  // ── Floating Food ──
  foodEmoji: {
    position: "absolute",
    fontSize: 36,
  },
  food1: {
    top: height * 0.12,
    left: 40,
  },
  food2: {
    top: height * 0.08,
    right: 50,
  },
  food3: {
    bottom: height * 0.18,
    left: 30,
  },
  food4: {
    bottom: height * 0.15,
    right: 40,
  },

  // ── Center Content ──
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Plate Decoration ──
  plateDecor: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  plateInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: "rgba(255, 122, 40, 0.15)",
  },
  plateRim: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: "rgba(255, 122, 40, 0.08)",
    borderStyle: "dashed",
  },

  // ── Logo ──
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "rgba(255, 122, 40, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 122, 40, 0.2)",
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    transform: [{ skewX: "-20deg" }],
  },

  // ── Title ──
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 24,
    letterSpacing: 8,
  },

  // ── Tagline ──
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: "500",
  },

  // ── Decorative Line ──
  decorLine: {
    width: 40,
    height: 3,
    backgroundColor: "#FF7A28",
    borderRadius: 2,
    marginTop: 16,
  },

  // ── Bottom Content ──
  bottomContent: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  bottomText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
  },
  dotRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dotActive: {
    backgroundColor: "#FF7A28",
    width: 20,
  },
});
