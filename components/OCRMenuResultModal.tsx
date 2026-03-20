import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OcrMenuItem } from '../lib/ocrService';
import { getFallbackImage } from '../lib/imageSearchService';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    visible: boolean;
    items: OcrMenuItem[];
    isLoading: boolean;
    onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Card ─────────────────────────────────────────────────────────────────────

const MenuItemCard = ({ item }: { item: OcrMenuItem }) => {
    const [added, setAdded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleAdd = () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    // Use Google Image Search result if available, fall back to Unsplash
    const primaryUri = item.imageUrl ?? getFallbackImage(item.imageQuery);
    const fallbackUri = getFallbackImage(item.imageQuery);
    const imageSource = { uri: imgError ? fallbackUri : primaryUri };

    return (
        <View style={styles.card}>
            {/* Food Image */}
            <Image
                source={imageSource}
                style={styles.cardImage}
                onError={() => setImgError(true)}
            />

            {/* Calorie badge */}
            <View style={styles.calorieBadge}>
                <MaterialCommunityIcons name="fire" size={10} color="#FF7A00" />
                <Text style={styles.calorieText}>{item.calories}</Text>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
                <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    <TouchableOpacity
                        style={[styles.addBtn, added && styles.addBtnAdded]}
                        onPress={handleAdd}
                        activeOpacity={0.75}
                    >
                        {added ? (
                            <Ionicons name="checkmark" size={18} color="#FFF" />
                        ) : (
                            <Ionicons name="add" size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const SkeletonCard = () => (
    <View style={[styles.card, styles.skeleton]}>
        <View style={[styles.cardImage, styles.skeletonBlock]} />
        <View style={styles.cardBody}>
            <View style={[styles.skeletonLine, { width: '80%', height: 14 }]} />
            <View style={[styles.skeletonLine, { width: '60%', height: 11, marginTop: 6 }]} />
            <View style={[styles.skeletonLine, { width: '40%', height: 18, marginTop: 14 }]} />
        </View>
    </View>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

export const OCRMenuResultModal: React.FC<Props> = ({
    visible,
    items,
    isLoading,
    onClose,
}) => {
    const renderItem = ({ item }: { item: OcrMenuItem }) => (
        <MenuItemCard item={item} />
    );

    const renderSkeletons = () => (
        <View style={styles.skeletonGrid}>
            {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons
                name="text-search"
                size={64}
                color="#E2E8F0"
            />
            <Text style={styles.emptyTitle}>No menu items found</Text>
            <Text style={styles.emptySubtitle}>
                Make sure the menu text is clearly visible and well-lit, then try again.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onClose}>
                <Ionicons name="camera-outline" size={16} color="#FFF" />
                <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <StatusBar barStyle="dark-content" backgroundColor="#FBFCFF" />
            <SafeAreaView style={styles.container}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Scanned Menu</Text>
                        {!isLoading && items.length > 0 && (
                            <View style={styles.countPill}>
                                <Text style={styles.countText}>
                                    {items.length} item{items.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={20} color="#181C2E" />
                    </TouchableOpacity>
                </View>

                {/* ── Info banner ── */}
                {!isLoading && items.length > 0 && (
                    <View style={styles.banner}>
                        <Ionicons name="information-circle-outline" size={14} color="#FF7A00" />
                        <Text style={styles.bannerText}>
                            Items extracted from your menu photo via Google Vision AI
                        </Text>
                    </View>
                )}

                {/* ── Body ── */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingCircle}>
                            <ActivityIndicator size="large" color="#FF7A00" />
                        </View>
                        <Text style={styles.loadingTitle}>Reading Menu…</Text>
                        <Text style={styles.loadingSubtitle}>
                            Google Vision AI is extracting items from your photo
                        </Text>
                        {renderSkeletons()}
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={
                            items.length === 0
                                ? styles.emptyListContent
                                : styles.listContent
                        }
                        ListEmptyComponent={renderEmpty}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFCFF',
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F5FA',
        backgroundColor: '#FFF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181C2E',
    },
    countPill: {
        backgroundColor: '#FFF4E5',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    countText: {
        color: '#FF7A00',
        fontSize: 12,
        fontWeight: '700',
    },
    closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F0F5FA',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Banner ──
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 6,
    },
    bannerText: {
        fontSize: 11,
        color: '#FF7A00',
        fontWeight: '500',
        flex: 1,
    },

    // ── Loading ──
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 30,
    },
    loadingCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFF4E5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181C2E',
        marginBottom: 6,
    },
    loadingSubtitle: {
        fontSize: 13,
        color: '#A0A5BA',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
        marginBottom: 28,
    },

    // ── Skeleton ──
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        gap: 14,
    },
    skeleton: {
        opacity: 0.5,
    },
    skeletonBlock: {
        backgroundColor: '#E2E8F0',
    },
    skeletonLine: {
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
    },

    // ── List ──
    listContent: {
        paddingHorizontal: 14,
        paddingTop: 16,
        paddingBottom: 60,
        gap: 14,
    },
    emptyListContent: {
        flexGrow: 1,
    },
    row: {
        justifyContent: 'space-between',
    },

    // ── Card ──
    card: {
        width: CARD_W,
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        marginBottom: 2,
    },
    cardImage: {
        width: '100%',
        height: 130,
        backgroundColor: '#F0F5FA',
    },
    calorieBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        gap: 3,
    },
    calorieText: {
        fontSize: 10,
        color: '#FF7A00',
        fontWeight: '700',
    },
    cardBody: {
        padding: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#181C2E',
        marginBottom: 4,
        lineHeight: 19,
    },
    itemDesc: {
        fontSize: 11,
        color: '#A0A5BA',
        lineHeight: 16,
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: '#181C2E',
    },
    addBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#FF7A00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnAdded: {
        backgroundColor: '#22C55E',
    },

    // ── Empty ──
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181C2E',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#A0A5BA',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7A00',
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 13,
        gap: 8,
    },
    retryText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },
});
