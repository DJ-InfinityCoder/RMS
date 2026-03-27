import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { AuthTheme } from '@/constants/AuthTheme';

interface QRCodeGeneratorProps {
    restaurantId: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ restaurantId }) => {
    const [qrCode, setQrCode] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchQRCode = async () => {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/qr-code`);
            if (response.ok) {
                const data = await response.json();
                setQrCode(data);
            }
        } catch (error) {
            console.error('Error fetching QR code:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQRCode();
    }, [restaurantId]);

    const generateQRCode = async () => {
        setGenerating(true);
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/qr-code`, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                setQrCode(data);
                Alert.alert('Success', 'QR Code generated successfully!');
            } else {
                Alert.alert('Error', 'Failed to generate QR Code');
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ margin: 20 }} color={AuthTheme.colors.primary} />;
    }

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.content}>
                <Title style={styles.title}>Restaurant QR Code</Title>
                <Paragraph style={styles.description}>
                    Customers can scan this code to view your digital menu instantly.
                </Paragraph>

                {qrCode ? (
                    <View style={styles.qrContainer}>
                        <Image 
                            source={{ uri: qrCode.qr_code_url }} 
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.idLabel}>ID: {restaurantId}</Text>
                    </View>
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>No QR Code Generated Yet</Text>
                    </View>
                )}

                <Button 
                    mode="contained" 
                    onPress={generateQRCode} 
                    loading={generating}
                    disabled={generating}
                    style={styles.button}
                    buttonColor={AuthTheme.colors.primary}
                >
                    {qrCode ? 'Regenerate QR Code' : 'Generate QR Code'}
                </Button>
                
                {qrCode && (
                    <Button 
                        mode="outlined" 
                        onPress={() => Alert.alert('Info', 'Print feature coming soon!')}
                        style={[styles.button, { marginTop: 10 }]}
                        textColor={AuthTheme.colors.primary}
                    >
                        Download / Print QR
                    </Button>
                )}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 16,
        borderRadius: 15,
        backgroundColor: '#fff',
        elevation: 4,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        color: AuthTheme.colors.primary,
        fontWeight: 'bold',
    },
    description: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 10,
    },
    qrContainer: {
        alignItems: 'center',
        marginVertical: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    idLabel: {
        marginTop: 10,
        fontSize: 10,
        color: '#999',
    },
    placeholder: {
        height: 200,
        width: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginVertical: 20,
        borderRadius: 10,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    placeholderText: {
        color: '#999',
    },
    button: {
        width: '100%',
        borderRadius: 8,
    },
});
