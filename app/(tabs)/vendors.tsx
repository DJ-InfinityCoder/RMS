import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Vendor {
    id: string;
    name: string;
    specialty: string;
    distance: string;
    rating: number;
    isOpen: boolean;
    price: string; // avg price
    image: string;
    tags: string[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const VENDORS: Vendor[] = [
    {
        id: '1',
        name: 'Raj Chaat Corner',
        specialty: 'Pani Puri & Chaat',
        distance: '0.3 km',
        rating: 4.8,
        isOpen: true,
        price: '₹20–₹50',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=70',
        tags: ['Chaat', 'Spicy', 'Veg'],
    },
    {
        id: '2',
        name: 'Mohan Tikki Wala',
        specialty: 'Aloo Tikki & Samosa',
        distance: '0.6 km',
        rating: 4.5,
        isOpen: true,
        price: '₹15–₹40',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=70',
        tags: ['Snacks', 'Fried', 'Veg'],
    },
    {
        id: '3',
        name: 'Bhaiya Ji Rolls',
        specialty: 'Egg & Paneer Rolls',
        distance: '1.1 km',
        rating: 4.6,
        isOpen: false,
        price: '₹40–₹80',
        image: 'https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=400&q=70',
        tags: ['Roll', 'Non-Veg', 'Fast Food'],
    },
    {
        id: '4',
        name: 'Shahi Kulfi Cart',
        specialty: 'Kulfi & Ice Cream',
        distance: '0.8 km',
        rating: 4.9,
        isOpen: true,
        price: '₹30–₹60',
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=70',
        tags: ['Dessert', 'Sweet', 'Cold'],
    },
    {
        id: '5',
        name: 'Dosa Express',
        specialty: 'South Indian Dosas',
        distance: '1.4 km',
        rating: 4.4,
        isOpen: true,
        price: '₹50–₹120',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=70',
        tags: ['South Indian', 'Veg', 'Breakfast'],
    },
    {
        id: '6',
        name: 'Amritsari Kulcha',
        specialty: 'Stuffed Kulcha & Chole',
        distance: '2.0 km',
        rating: 4.7,
        isOpen: false,
        price: '₹60–₹100',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=70',
        tags: ['Punjabi', 'Veg'],
    },
];

const FILTERS = ['All', 'Open Now', 'Nearest', 'Top Rated', 'Veg'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function StreetVendors() {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered = VENDORS.filter((v) => {
        const matchesSearch =
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.specialty.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            activeFilter === 'All' ||
            (activeFilter === 'Open Now' && v.isOpen) ||
            (activeFilter === 'Nearest' && parseFloat(v.distance) < 1) ||
            (activeFilter === 'Top Rated' && v.rating >= 4.7) ||
            (activeFilter === 'Veg' && v.tags.includes('Veg'));

        return matchesSearch && matchesFilter;
    });

    const renderVendor = ({ item }: { item: Vendor }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />

            {/* Open/Closed badge */}
            <View style={[styles.badge, item.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                <Text style={styles.badgeText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.vendorName}>{item.name}</Text>
                <Text style={styles.specialty}>{item.specialty}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="star" size={12} color="#FF7A00" />
                        <Text style={styles.metaText}>{item.rating}</Text>
                    </View>
                    <View style={styles.metaDot} />
                    <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={12} color="#A0A5BA" />
                        <Text style={styles.metaText}>{item.distance}</Text>
                    </View>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{item.price}</Text>
                </View>

                <View style={styles.tagsRow}>
                    {item.tags.map((tag) => (
                        <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Street Vendors</Text>
                    <Text style={styles.headerSub}>Discover local food gems 🛒</Text>
                </View>
                <TouchableOpacity style={styles.mapBtn}>
                    <Ionicons name="map-outline" size={22} color="#FF7A00" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color="#A0A5BA" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search vendors, food..."
                    placeholderTextColor="#A0A5BA"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Filter Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Count */}
            <Text style={styles.countText}>{filtered.length} vendors nearby</Text>

            {/* Vendor List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderVendor}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#181C2E' },
    headerSub: { fontSize: 13, color: '#A0A5BA', marginTop: 2 },
    mapBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF4E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F5FA',
        marginHorizontal: 20,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#181C2E' },
    filterRow: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
    filterPill: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F5FA',
        marginRight: 8,
    },
    filterPillActive: { backgroundColor: '#FF7A00' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#A0A5BA' },
    filterTextActive: { color: '#FFF' },
    countText: {
        marginHorizontal: 20,
        marginBottom: 10,
        fontSize: 13,
        color: '#A0A5BA',
        fontWeight: '500',
    },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 18,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
    },
    cardImage: { width: '100%', height: 160, backgroundColor: '#F0F5FA' },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeOpen: { backgroundColor: '#22C55E' },
    badgeClosed: { backgroundColor: '#EF4444' },
    badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    cardBody: { padding: 14 },
    vendorName: { fontSize: 17, fontWeight: '700', color: '#181C2E', marginBottom: 3 },
    specialty: { fontSize: 13, color: '#A0A5BA', marginBottom: 10 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D0D5DD', marginHorizontal: 6 },
    metaText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: {
        backgroundColor: '#FFF4E5',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tagText: { fontSize: 11, color: '#FF7A00', fontWeight: '600' },
});
