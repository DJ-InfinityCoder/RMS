import { AuthTheme } from '@/constants/AuthTheme';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Paragraph, Title, Chip, Button } from 'react-native-paper';

interface OrderItem {
    dish: { name: string };
    quantity: number;
}

interface Order {
    id: string;
    status: string;
    created_at: string;
    user: { full_name: string; phone: string } | null;
    order_items: OrderItem[];
}

export const OrderTracker = ({ restaurantId }: { restaurantId: string }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/orders`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Polling ogni 30s
        return () => clearInterval(interval);
    }, [restaurantId]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await fetch(`/api/restaurants/${restaurantId}/orders`, {
                method: 'PATCH',
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            fetchOrders();
        } catch (error) {
            console.error('Update status error:', error);
        }
    };

    const runAction = (orderId: string, status: string) => {
        updateStatus(orderId, status);
    };

    const renderOrder = ({ item }: { item: Order }) => (
        <Card style={styles.orderCard}>
            <Card.Content>
                <View style={styles.orderHeader}>
                    <Title style={styles.orderId}>Order #{item.id.slice(0, 8)}</Title>
                    <Chip 
                        textStyle={{ color: 'white' }}
                        style={[
                            styles.statusChip, 
                            { backgroundColor: getStatusColor(item.status) }
                        ]}
                    >
                        {item.status}
                    </Chip>
                </View>
                <Paragraph style={styles.customerName}>
                    Customer: {item.user?.full_name || 'Guest'}
                </Paragraph>
                <View style={styles.divider} />
                {item.order_items.map((oi, idx) => (
                    <Text key={idx} style={styles.itemText}>
                        • {oi.dish.name} x{oi.quantity}
                    </Text>
                ))}
            </Card.Content>
            <Card.Actions style={styles.actions}>
                {item.status === 'PENDING' && (
                    <Button 
                        mode="contained" 
                        buttonColor="#4CAF50" 
                        onPress={() => runAction(item.id, 'CONFIRMED')}
                    >
                        Confirm
                    </Button>
                )}
                {item.status === 'CONFIRMED' && (
                    <Button 
                        mode="contained" 
                        buttonColor="#2196F3" 
                        onPress={() => runAction(item.id, 'COMPLETED')}
                    >
                        Mark Ready
                    </Button>
                )}
            </Card.Actions>
        </Card>
    );

    if (loading) return <ActivityIndicator style={{ marginTop: 20 }} color={AuthTheme.colors.primary} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders for your restaurant yet.</Text>}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false} // Since it's inside Dashboard ScrollView
            />
        </View>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return '#FF9800';
        case 'CONFIRMED': return '#2196F3';
        case 'COMPLETED': return '#4CAF50';
        case 'CANCELLED': return '#F44336';
        default: return '#9E9E9E';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    orderCard: {
        marginBottom: 15,
        backgroundColor: '#FFF',
        elevation: 2,
        borderRadius: 12,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusChip: {
        height: 32,
    },
    customerName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 10,
    },
    itemText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    actions: {
        justifyContent: 'flex-end',
        paddingTop: 0,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontSize: 16,
    },
});
