import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { parseQRValue } from '@/lib/restaurantQR';
import { setSelectedRestaurant } from '@/lib/selectedRestaurant';
import { restaurants, getRestaurantsFromApi } from '@/data/restaurants';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Accent Colors (Matching Snap Menu) ───────────────────────────────────────

const COLORS = {
  bg: '#0f0f0f',
  accent: '#FF7A00',        // Orange for QR (to distinguish from purple Snap Menu)
  accentLight: '#FF9533',
  accentGlow: 'rgba(255, 122, 0, 0.35)',
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.4)',
  success: '#34D399',
  error: '#EF4444',
  overlay: 'rgba(0,0,0,0.55)',
};

export default function ScannerScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (restaurants.length === 0) {
      getRestaurantsFromApi();
    }
  }, []);

  // State
  const [isScanning, setIsScanning] = useState(true);
  const [flashActive, setFlashActive] = useState(false);
  const [cameraFlash, setCameraFlash] = useState<'off' | 'on'>('off');

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Continuous pulse effect
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Scan line animation
  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, []);

  // ─── Flash Feedback ────────────────────────────────────────────────────────

  const triggerSuccessFlash = useCallback(() => {
    setFlashActive(true);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setFlashActive(false));
  }, []);

  // ─── QR Scan Handler ────────────────────────────────────────────────────────

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (!isScanning) return;

    const restaurantId = parseQRValue(data);

    if (!restaurantId) {
      setIsScanning(false);
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not recognized by RMS. Please scan a valid restaurant menu QR.',
        [{ text: 'OK', onPress: () => setIsScanning(true) }]
      );
      return;
    }

    const restaurant = restaurants.find((r) => r.id === restaurantId);

    if (!restaurant) {
      setIsScanning(false);
      Alert.alert(
        'Restaurant Not Found',
        `No restaurant found for ID: ${restaurantId}. Please scan a valid menu QR.`,
        [{ text: 'OK', onPress: () => setIsScanning(true) }]
      );
      return;
    }

    setIsScanning(false);
    triggerSuccessFlash();

    // Navigate to the restaurant page
    setSelectedRestaurant(restaurantId);
    
    setTimeout(() => {
      router.replace(`/restaurant/${restaurantId}` as any);
    }, 500);
  };
  // ─── Gallery Pick ───────────────────────────────────────────────────────────

  const handleGalleryPick = async () => {
    if (!isScanning) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      // In a real app, you'd use a QR library that works with base64/URI
      // For Expo, BarCodeScanner only works with the live camera feed
      // We could use an external JS library here if needed, but for now 
      // we'll keep it simple as the primary use case is live scanning.
      Alert.alert('Gallery Scan', 'Live camera scanning is recommended for QR codes.');
    }
  };

  const toggleFlash = () => {
    setCameraFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  // ─── Permission Gate ────────────────────────────────────────────────────────

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconWrap}>
            <Ionicons name="qr-code" size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.permissionTitle}>QR Scanner Access</Text>
          <Text style={styles.permissionDesc}>
            Allow camera access to scan restaurant QR codes and view their digital menus instantly
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionBtnText}>Allow Camera</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_H * 0.4],
  });

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={cameraFlash === 'on'}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        {/* Dark gradient overlay */}
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />

        {/* Scanning line effect */}
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineTranslateY }] },
          ]}
          pointerEvents="none"
        />

        {/* Success flash */}
        {flashActive && (
          <Animated.View
            style={[styles.flashOverlay, { opacity: fadeAnim }]}
            pointerEvents="none"
          />
        )}

        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.glassBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.titlePill}>
            <Ionicons
              name="qr-code-outline"
              size={16}
              color={COLORS.accent}
            />
            <Text style={styles.titleText}>Scan QR Code</Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* ── Center Guide ── */}
        <View style={styles.centerGuide}>
          <Animated.View style={[styles.guideFrame, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.guideCorner, styles.guideCornerTL]} />
            <View style={[styles.guideCorner, styles.guideCornerTR]} />
            <View style={[styles.guideCorner, styles.guideCornerBL]} />
            <View style={[styles.guideCorner, styles.guideCornerBR]} />
          </Animated.View>
          <Text style={styles.guideText}>
            Point your camera at a restaurant QR code
          </Text>
        </View>

        {/* ── Bottom Control Bar ── */}
        <View style={styles.bottomBar}>
          {/* Gallery */}
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={handleGalleryPick}
            activeOpacity={0.7}
          >
            <View style={styles.sideBtnInner}>
              <Ionicons name="images" size={24} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.sideBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          {/* Center Info (instead of large capture btn) */}
          <Animated.View style={[styles.infoCircle, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={32} color={COLORS.accent} />
          </Animated.View>

          {/* Flash toggle */}
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <View style={styles.sideBtnInner}>
              <Ionicons
                name={cameraFlash === 'on' ? "flash" : "flash-outline"}
                size={24}
                color={COLORS.textPrimary}
              />
            </View>
            <Text style={styles.sideBtnLabel}>Flash</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const GUIDE_SIZE = SCREEN_W * 0.65;
const CORNER_LEN = 32;
const CORNER_W = 4;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  camera: {
    flex: 1,
  },

  // ── Gradients ──
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2,
  },

  // ── Scan Line ──
  scanLine: {
    position: 'absolute',
    left: SCREEN_W * 0.15,
    right: SCREEN_W * 0.15,
    height: 3,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
    top: SCREEN_H * 0.3,
    zIndex: 3,
    borderRadius: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },

  // ── Flash ──
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.accent,
    zIndex: 20,
  },

  // ── Top Bar ──
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 30) + 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  titleText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Center Guide ──
  centerGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  guideFrame: {
    width: GUIDE_SIZE,
    height: GUIDE_SIZE,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderColor: COLORS.accent,
  },
  guideCornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderTopLeftRadius: 16,
  },
  guideCornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderTopRightRadius: 16,
  },
  guideCornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderBottomLeftRadius: 16,
  },
  guideCornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderBottomRightRadius: 16,
  },
  guideText: {
    marginTop: 32,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 40,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    opacity: 0.9,
  },

  // ── Bottom Bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
    zIndex: 10,
    gap: 40,
  },
  sideBtn: {
    alignItems: 'center',
    gap: 8,
  },
  sideBtnInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  infoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,122,0,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,122,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },

  // ── Permission ──
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  permissionCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  permissionIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,122,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  permissionDesc: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 12,
  },
  permissionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
