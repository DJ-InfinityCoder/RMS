import { AuthTheme } from '@/constants/AuthTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SkeletonLoader } from '@/components/admin/SkeletonLoader';

const C = AuthTheme.colors;
const RESTAURANT_ID = 'aa88df4a-8740-4f51-872f-5732155f9889';

export default function ReviewsScreen() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);

    const fetchRestaurantAndReviews = async () => {
        try {
            const restRes = await fetch('/api/restaurants');
            const restaurants = await restRes.json();
            if (restaurants.length > 0) {
                const id = restaurants[0].id;
                setRestaurantId(id);
                fetchReviews(id);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchReviews = async (id: string) => {
        try {
            const res = await fetch(`/api/restaurants/${id}/reviews`);
            const data = await res.json();
            setReviews(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRestaurantAndReviews();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        if (restaurantId) fetchReviews(restaurantId);
        else fetchRestaurantAndReviews();
    };

    const renderReview = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/100' }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user?.full_name || 'Guest User'}</Text>
                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <Ionicons 
                                key={s} 
                                name={s <= item.rating ? "star" : "star-outline"} 
                                size={14} 
                                color={s <= item.rating ? "#FFB800" : "#E0E6ED"} 
                            />
                        ))}
                        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
            
            <Text style={styles.comment}>{item.comment}</Text>
            
            {item.dish && (
                <View style={styles.dishTag}>
                    <Ionicons name="fast-food-outline" size={14} color={C.primary} />
                    <Text style={styles.dishName}>{item.dish.name}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AdminHeader restaurantName="Spice Cave" title="Customer Feedback" />
            
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Recent Reviews</Text>
                
                {loading ? (
                    <View style={{ flex: 1 }}>
                        <SkeletonLoader.ReviewItem />
                        <SkeletonLoader.ReviewItem />
                        <SkeletonLoader.ReviewItem />
                    </View>
                ) : reviews.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={48} color={C.textGrey} />
                        <Text style={styles.emptyText}>No reviews collected yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={reviews}
                        renderItem={renderReview}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.backgroundGrey },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: C.darkNavy, marginBottom: 15, letterSpacing: 0.3 },
    list: { paddingBottom: 40 },
    card: {
        backgroundColor: C.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F2F5' },
    userInfo: { marginLeft: 12, flex: 1 },
    userName: { fontSize: 16, fontWeight: '800', color: C.darkNavy },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
    dateText: { fontSize: 12, color: C.textGrey, marginLeft: 8, fontWeight: '500' },
    comment: { fontSize: 14, color: C.darkNavy, lineHeight: 22, marginBottom: 16, opacity: 0.8 },
    dishTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 6
    },
    dishName: { fontSize: 12, fontWeight: '700', color: C.primary },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 12, color: C.textGrey, fontSize: 15, fontWeight: '500' },
});
