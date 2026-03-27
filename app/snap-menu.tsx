/**
 * Snap Menu — Full-Screen Camera Scanner
 *
 * Premium full-screen camera experience for scanning restaurant menus.
 * Features:
 *  - Edge-to-edge camera view
 *  - Glassmorphism floating controls
 *  - Gallery picker support
 *  - Animated processing overlay
 *  - Multi-stage loading feedback
 */

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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  runMenuPipeline,
  PipelineProgress,
  PipelineResult,
} from '@/services/pipeline';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Accent Colors ────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0f0f0f',
  accent: '#7C5CFC',        // soft purple
  accentLight: '#9B82FC',
  accentGlow: 'rgba(124, 92, 252, 0.35)',
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.4)',
  success: '#34D399',
  error: '#EF4444',
  overlay: 'rgba(0,0,0,0.55)',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SnapMenuScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<PipelineProgress | null>(null);
  const [flashActive, setFlashActive] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Continuous pulse on capture button
  useEffect(() => {
    if (isProcessing) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isProcessing]);

  // Scan line animation
  useEffect(() => {
    if (isProcessing) return;
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, [isProcessing]);

  // Shimmer animation for loading
  useEffect(() => {
    if (!isProcessing) return;
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [isProcessing]);

  // ─── Flash & Capture Feedback ───────────────────────────────────────────────

  const triggerCaptureFlash = useCallback(() => {
    setFlashActive(true);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlashActive(false));

    // Ring animation
    ringAnim.setValue(0);
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  // ─── Process Image ──────────────────────────────────────────────────────────

  const processImage = async (base64: string) => {
    try {
      setIsProcessing(true);
      setProgress({ stage: 'capturing', message: 'Processing...', progress: 5 });

      // Animate progress bar
      progressAnim.setValue(0);

      const result: PipelineResult = await runMenuPipeline(
        base64,
        (p: PipelineProgress) => {
          setProgress(p);
          Animated.timing(progressAnim, {
            toValue: p.progress / 100,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        }
      );

      // Navigate to results
      router.push({
        pathname: '/menu-result',
        params: {
          menuData: JSON.stringify(result.menu),
          processingTime: String(result.processingTimeMs),
        },
      });
    } catch (error: any) {
      console.error('Pipeline error:', error);
      setProgress({
        stage: 'error',
        message: error.message ?? 'Failed to scan menu',
        progress: 0,
      });

      // Auto-clear error after 3s
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(null);
      }, 3000);
      return;
    }

    setIsProcessing(false);
    setProgress(null);
  };

  // ─── Camera Capture ─────────────────────────────────────────────────────────

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    triggerCaptureFlash();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      await processImage(photo.base64);
    } catch (err: any) {
      console.error('Capture error:', err);
    }
  };

  // ─── Gallery Pick ───────────────────────────────────────────────────────────

  const handleGalleryPick = async () => {
    if (isProcessing) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      base64: true,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      await processImage(result.assets[0].base64);
    }
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
            <Ionicons name="camera" size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionDesc}>
            Allow camera access to scan restaurant menus and extract items instantly
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

  // ─── Processing Stage Info ──────────────────────────────────────────────────

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'capturing':
        return 'camera-outline';
      case 'ocr':
        return 'text-outline';
      case 'ai_parsing':
        return 'sparkles-outline';
      case 'fetching_images':
        return 'images-outline';
      case 'complete':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'hourglass-outline';
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_H * 0.5],
  });

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── Full-Screen Camera ── */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Dark gradient overlay */}
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />

        {/* Scanning line effect */}
        {!isProcessing && (
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineTranslateY }] },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Capture flash */}
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
            <MaterialCommunityIcons
              name="text-recognition"
              size={16}
              color={COLORS.accent}
            />
            <Text style={styles.titleText}>Snap Menu</Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* ── Center Guide ── */}
        {!isProcessing && (
          <View style={styles.centerGuide}>
            {/* Corner brackets */}
            <View style={styles.guideFrame}>
              <View style={[styles.guideCorner, styles.guideCornerTL]} />
              <View style={[styles.guideCorner, styles.guideCornerTR]} />
              <View style={[styles.guideCorner, styles.guideCornerBL]} />
              <View style={[styles.guideCorner, styles.guideCornerBR]} />
            </View>
            <Text style={styles.guideText}>
              Position the menu within the frame
            </Text>
          </View>
        )}

        {/* ── Processing Overlay ── */}
        {isProcessing && progress && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingCard}>
              {/* Spinning shimmer ring */}
              <View style={styles.processingIconContainer}>
                {progress.stage === 'error' ? (
                  <Ionicons
                    name="alert-circle"
                    size={48}
                    color={COLORS.error}
                  />
                ) : progress.stage === 'complete' ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color={COLORS.success}
                  />
                ) : (
                  <View style={styles.processingSpinner}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                  </View>
                )}
              </View>

              <Text style={styles.processingTitle}>
                {progress.stage === 'error' ? 'Scan Failed' : progress.message}
              </Text>

              {progress.stage === 'error' && (
                <Text style={styles.processingSubtitle}>
                  {progress.message}
                </Text>
              )}

              {/* Progress bar */}
              {progress.stage !== 'error' && (
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              )}

              {/* Stage indicators */}
              {progress.stage !== 'error' && (
                <View style={styles.stageRow}>
                  {['ocr', 'ai_parsing', 'fetching_images'].map(
                    (stage, idx) => {
                      const isActive = progress.stage === stage;
                      const isDone =
                        ['ocr', 'ai_parsing', 'fetching_images', 'complete'].indexOf(
                          progress.stage
                        ) >
                        ['ocr', 'ai_parsing', 'fetching_images'].indexOf(stage);

                      return (
                        <View key={stage} style={styles.stageItem}>
                          <View
                            style={[
                              styles.stageDot,
                              isActive && styles.stageDotActive,
                              isDone && styles.stageDotDone,
                            ]}
                          >
                            {isDone ? (
                              <Ionicons
                                name="checkmark"
                                size={10}
                                color="#FFF"
                              />
                            ) : (
                              <Text style={styles.stageDotNum}>
                                {idx + 1}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stageLabel,
                              (isActive || isDone) &&
                                styles.stageLabelActive,
                            ]}
                          >
                            {stage === 'ocr'
                              ? 'OCR'
                              : stage === 'ai_parsing'
                              ? 'AI Parse'
                              : 'Images'}
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>
              )}

              {/* Retry button on error */}
              {progress.stage === 'error' && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    setIsProcessing(false);
                    setProgress(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={18} color="#FFF" />
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── Bottom Control Bar ── */}
        {!isProcessing && (
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

            {/* Capture Button */}
            <Animated.View
              style={[
                styles.captureOuter,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={handleCapture}
                activeOpacity={0.7}
              >
                <View style={styles.captureInner}>
                  <View style={styles.captureCore} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Flash placeholder for symmetry */}
            <TouchableOpacity
              style={styles.sideBtn}
              activeOpacity={0.7}
              onPress={() => {/* Future: toggle flash */}}
            >
              <View style={styles.sideBtnInner}>
                <Ionicons
                  name="flash-outline"
                  size={24}
                  color={COLORS.textPrimary}
                />
              </View>
              <Text style={styles.sideBtnLabel}>Flash</Text>
            </TouchableOpacity>
          </View>
        )}
      </CameraView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const GUIDE_SIZE = SCREEN_W * 0.78;
const CORNER_LEN = 28;
const CORNER_W = 3;

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
    height: 140,
    backgroundColor: 'transparent',
    // Use linear-gradient-like effect
    borderBottomWidth: 0,
    zIndex: 2,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 2,
  },

  // ── Scan Line ──
  scanLine: {
    position: 'absolute',
    left: SCREEN_W * 0.1,
    right: SCREEN_W * 0.1,
    height: 2,
    backgroundColor: COLORS.accent,
    opacity: 0.5,
    top: SCREEN_H * 0.2,
    zIndex: 3,
    borderRadius: 1,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Flash ──
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
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
    height: GUIDE_SIZE * 0.65,
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
    borderTopLeftRadius: 8,
  },
  guideCornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderTopRightRadius: 8,
  },
  guideCornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderBottomLeftRadius: 8,
  },
  guideCornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderBottomRightRadius: 8,
  },
  guideText: {
    marginTop: 18,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // ── Processing Overlay ──
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,15,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  processingCard: {
    width: SCREEN_W * 0.82,
    backgroundColor: 'rgba(30,30,40,0.95)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
  },
  processingIconContainer: {
    marginBottom: 20,
  },
  processingSpinner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(124,92,252,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  processingSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  // ── Progress Bar ──
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginTop: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },

  // ── Stage Indicators ──
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  stageItem: {
    alignItems: 'center',
    gap: 6,
  },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  stageDotDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stageDotNum: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  stageLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  stageLabelActive: {
    color: COLORS.textPrimary,
  },

  // ── Retry Button ──
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    marginTop: 16,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Bottom Bar ──
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  sideBtn: {
    alignItems: 'center',
    gap: 6,
  },
  sideBtnInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Capture Button ──
  captureOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  captureCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
  },

  // ── Permission ──
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCard: {
    width: SCREEN_W * 0.82,
    backgroundColor: 'rgba(30,30,40,0.95)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
  },
  permissionIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(124,92,252,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  permissionDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 10,
  },
  permissionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
