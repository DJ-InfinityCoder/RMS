import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { setSelectedRestaurant } from '../lib/selectedRestaurant';
import { parseQRValue } from '../lib/restaurantQR';
import { restaurants } from '../data/restaurants';
import { runOCR, parseMenuText, OcrMenuItem } from '../lib/ocrService';
import { searchFoodImage } from '../lib/imageSearchService';
import { OCRMenuResultModal } from './OCRMenuResultModal';

type ScanMode = 'qr' | 'ocr';

export const ScannerWidget = () => {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<ScanMode>('qr');
    const [isScanning, setIsScanning] = useState(true);

    // OCR state
    const [isOCRLoading, setIsOCRLoading] = useState(false);
    const [ocrItems, setOcrItems] = useState<OcrMenuItem[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const cameraRef = useRef<CameraView>(null);

    // QR flash feedback
    const flashAnim = useRef(new Animated.Value(0)).current;

    // ─── Permission Gate ────────────────────────────────────────────────────────

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FF7A00" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={48} color="#FF7A00" />
                    <Text style={styles.permissionText}>
                        Camera access is needed to scan QR codes and read menus
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ─── QR Scan Handler ────────────────────────────────────────────────────────

    const triggerFlash = (success: boolean) => {
        flashAnim.setValue(1);
        Animated.timing(flashAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
        }).start();
    };

    const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
        if (mode !== 'qr' || !isScanning) return;

        setIsScanning(false);

        const restaurantId = parseQRValue(data);

        if (!restaurantId) {
            triggerFlash(false);
            Alert.alert(
                'Invalid QR Code',
                'This QR code is not a valid restaurant code.',
                [{ text: 'Try Again', onPress: () => setIsScanning(true) }]
            );
            return;
        }

        const restaurant = restaurants.find((r) => r.id === restaurantId);

        if (!restaurant) {
            triggerFlash(false);
            Alert.alert(
                'Restaurant Not Found',
                `No restaurant found for ID: ${restaurantId}`,
                [{ text: 'OK', onPress: () => setIsScanning(true) }]
            );
            return;
        }

        triggerFlash(true);

        // Navigate to the restaurant page
        setSelectedRestaurant(restaurantId);
        // Small delay so the flash animation plays before navigation
        setTimeout(() => {
            router.push('/restaurant' as any);
            setIsScanning(true);
        }, 400);
    };

    // ─── OCR Snap Handler ───────────────────────────────────────────────────────

    const handleSnapMenu = async () => {
        if (!cameraRef.current) return;

        try {
            setIsOCRLoading(true);
            setIsModalVisible(true);
            setOcrItems([]);

            // ── Step 1: Capture photo (base64 for OCR.space) ──
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.8,
                skipProcessing: false,
            });

            if (!photo?.base64) {
                throw new Error('Failed to capture image. Please try again.');
            }

            // ── Step 2: OCR.space free API — extract text from the photo ──
            const rawText = await runOCR(photo.base64);

            // ── Step 3: Parse raw OCR text into menu item objects ──
            const parsed = parseMenuText(rawText);

            if (parsed.length === 0) {
                setOcrItems([]);
                return;
            }

            // ── Step 4: Show skeleton cards immediately ──
            setOcrItems(parsed);

            // ── Step 5: Google Image Search — fetch a food photo per item ──
            // Run searches in parallel (max 6 to respect quota)
            const capped = parsed.slice(0, 6);
            const withImages = await Promise.all(
                capped.map(async (item) => {
                    const url = await searchFoodImage(item.imageQuery);
                    return { ...item, imageUrl: url ?? undefined };
                })
            );
            setOcrItems(withImages);
        } catch (err: any) {
            console.error('OCR Error:', err);
            setIsModalVisible(false);
            Alert.alert(
                'Scan Failed',
                err?.message ?? 'Could not read the menu. Please try again.'
            );
        } finally {
            setIsOCRLoading(false);
        }
    };

    const handleModeSwitch = (newMode: ScanMode) => {
        setIsScanning(true); // reset on switch
        setMode(newMode);
    };

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            <View style={styles.container}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={mode === 'qr' ? handleBarcodeScanned : undefined}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                >
                    {/* QR success/fail flash overlay */}
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.flashOverlay,
                            { opacity: flashAnim },
                        ]}
                    />

                    {/* ── QR Mode UI ── */}
                    {mode === 'qr' && (
                        <View style={styles.qrOverlay}>
                            <View style={styles.qrFinderOuter}>
                                {/* Corner marks */}
                                <View style={[styles.corner, styles.cornerTL]} />
                                <View style={[styles.corner, styles.cornerTR]} />
                                <View style={[styles.corner, styles.cornerBL]} />
                                <View style={[styles.corner, styles.cornerBR]} />
                            </View>
                            <Text style={styles.qrHint}>Point at a restaurant QR code</Text>
                        </View>
                    )}

                    {/* ── OCR Mode UI ── */}
                    {mode === 'ocr' && (
                        <View style={styles.ocrOverlay}>
                            {isOCRLoading ? (
                                <View style={styles.ocrLoadingPill}>
                                    <ActivityIndicator size="small" color="#FFF" />
                                    <Text style={styles.ocrLoadingText}>Reading menu…</Text>
                                </View>
                            ) : (
                                <View style={styles.snapContainer}>
                                    <TouchableOpacity
                                        style={styles.snapRing}
                                        onPress={handleSnapMenu}
                                        activeOpacity={0.75}
                                    >
                                        <View style={styles.snapInner}>
                                            <MaterialCommunityIcons name="camera" size={28} color="#FFF" />
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={styles.snapLabel}>Snap Menu</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ── Mode Toggle ── */}
                    <View style={styles.toggleBar}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, mode === 'qr' && styles.toggleActive]}
                            onPress={() => handleModeSwitch('qr')}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="qr-code-outline"
                                size={16}
                                color={mode === 'qr' ? '#FFF' : 'rgba(255,255,255,0.65)'}
                            />
                            <Text style={[styles.toggleLabel, mode === 'qr' && styles.toggleLabelActive]}>
                                Scan QR
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.toggleDivider} />

                        <TouchableOpacity
                            style={[styles.toggleBtn, mode === 'ocr' && styles.toggleActive]}
                            onPress={() => handleModeSwitch('ocr')}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons
                                name="text-recognition"
                                size={16}
                                color={mode === 'ocr' ? '#FFF' : 'rgba(255,255,255,0.65)'}
                            />
                            <Text style={[styles.toggleLabel, mode === 'ocr' && styles.toggleLabelActive]}>
                                Read Menu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>

            {/* OCR Results Modal */}
            <OCRMenuResultModal
                visible={isModalVisible}
                items={ocrItems}
                isLoading={isOCRLoading}
                onClose={() => setIsModalVisible(false)}
            />
        </>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;
const CORNER_RADIUS = 6;

const styles = StyleSheet.create({
    container: {
        height: 280,
        marginVertical: 12,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
    },
    camera: {
        flex: 1,
    },
    flashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 122, 0, 0.35)',
        zIndex: 10,
    },

    // ── Permission ──
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#FBFCFF',
    },
    permissionText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#32343E',
        marginVertical: 18,
        lineHeight: 22,
    },
    permissionButton: {
        backgroundColor: '#FF7A00',
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 14,
    },
    permissionButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },

    // ── QR Overlay ──
    qrOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50,
    },
    qrFinderOuter: {
        width: 170,
        height: 170,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: '#FF7A00',
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderTopLeftRadius: CORNER_RADIUS,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderTopRightRadius: CORNER_RADIUS,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderBottomLeftRadius: CORNER_RADIUS,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderBottomRightRadius: CORNER_RADIUS,
    },
    qrHint: {
        marginTop: 18,
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    // ── OCR Overlay ──
    ocrOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50,
        backgroundColor: 'rgba(0,0,0,0.18)',
    },
    snapContainer: {
        alignItems: 'center',
    },
    snapRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    snapInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF7A00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    snapLabel: {
        marginTop: 10,
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
        textShadowColor: 'rgba(0,0,0,0.55)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    ocrLoadingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    ocrLoadingText: {
        color: '#FFF',
        marginLeft: 10,
        fontWeight: '600',
        fontSize: 14,
    },

    // ── Toggle Bar ──
    toggleBar: {
        position: 'absolute',
        bottom: 12,
        left: 18,
        right: 18,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.62)',
        borderRadius: 32,
        padding: 4,
        alignItems: 'center',
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 28,
        gap: 6,
    },
    toggleActive: {
        backgroundColor: '#FF7A00',
    },
    toggleDivider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    toggleLabel: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
    },
    toggleLabelActive: {
        color: '#FFF',
    },
});
