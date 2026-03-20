import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OcrMenuItem } from '../lib/ocrService';

const { width } = Dimensions.get('window');

interface Props {
    visible: boolean;
    items: OcrMenuItem[];
    isLoading: boolean;
    onClose: () => void;
}

export const OCRMenuResultModal: React.FC<Props> = ({
    visible,
    items,
    isLoading,
    onClose,
}) => {
    const getImageUri = (query: string) =>
        `https://source.unsplash.com/400x300/?food,${encodeURIComponent(query)}`;

    const renderItem = ({ item }: { item: OcrMenuItem }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: getImageUri(item.imageQuery) }}
                style={styles.cardImage}
                defaultSource={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=60' }}
            />
            <View style={styles.cardBody}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
                        <Ionicons name="add" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={56} color="#D0D0D0" />
            <Text style={styles.emptyTitle}>No menu items detected</Text>
            <Text style={styles.emptySubtitle}>
                Try snapping a clearer, well-lit photo of the menu. Make sure item names and prices are visible.
            </Text>
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
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Scanned Menu</Text>
                        {!isLoading && items.length > 0 && (
                            <Text style={styles.headerSubtitle}>{items.length} items found</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                        <Ionicons name="close" size={22} color="#181C2E" />
                    </TouchableOpacity>
                </View>

                {/* Body */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF7A00" />
                        <Text style={styles.loadingText}>Reading menu with AI…</Text>
                        <Text style={styles.loadingSubtext}>This takes a few seconds</Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={renderEmpty}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFCFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F5FA',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#181C2E',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#FF7A00',
        fontWeight: '600',
        marginTop: 2,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F5FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#181C2E',
        marginTop: 20,
    },
    loadingSubtext: {
        fontSize: 13,
        color: '#A0A5BA',
        marginTop: 6,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F5FA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 110,
        backgroundColor: '#F0F5FA',
    },
    cardBody: {
        padding: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#181C2E',
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 12,
        color: '#A0A5BA',
        lineHeight: 17,
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#181C2E',
    },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF7A00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
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
    },
});
