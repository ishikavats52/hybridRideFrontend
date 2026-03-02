import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faStar } from '@fortawesome/free-solid-svg-icons';

const DriverOffersScreen = () => {
    const navigation = useNavigation();

    const drivers = [
        {
            id: '1',
            name: 'Michael',
            rating: 4.9,
            car: 'Toyota Camry',
            price: 13,
            timeAway: '3 min away',
            initial: 'M',
            color: '#CBD5E1', // Light Gray
        },
        {
            id: '2',
            name: 'Sarah',
            rating: 5.0,
            car: 'Honda Civic',
            price: 12,
            timeAway: '5 min away',
            initial: 'S',
            color: '#A7F3D0', // Light Teal
        },
        {
            id: '3',
            name: 'David',
            rating: 4.8,
            car: 'Tesla Model 3',
            price: 15,
            timeAway: '2 min away',
            initial: 'D',
            color: '#BFDBFE', // Light Blue
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <FontAwesomeIcon icon={faTimes} size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Drivers offering rides...</Text>
                <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {drivers.map((driver) => (
                    <View key={driver.id} style={styles.driverCard}>
                        {/* Driver Info Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.driverProfile}>
                                <View style={[styles.avatar, { backgroundColor: driver.color }]}>
                                    <Text style={styles.avatarText}>{driver.initial}</Text>
                                </View>
                                <View style={styles.driverDetails}>
                                    <Text style={styles.driverName}>{driver.name}</Text>
                                    <View style={styles.ratingContainer}>
                                        <FontAwesomeIcon icon={faStar} size={12} color="#F59E0B" />
                                        <Text style={styles.ratingText}>{driver.rating}</Text>
                                        <Text style={styles.dot}>•</Text>
                                        <Text style={styles.carModel}>{driver.car}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceText}>₹{driver.price}</Text>
                                <Text style={styles.offeredText}>Offered</Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.cardActions}>
                            <View style={styles.timeTag}>
                                <Text style={styles.timeTagText}>{driver.timeAway}</Text>
                            </View>

                            <View style={styles.buttonGroup}>
                                <TouchableOpacity style={styles.declineButton}>
                                    <Text style={styles.declineText}>Decline</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.acceptButton} onPress={() => navigation.navigate('DriverAccepted' as never, { driver } as never)}>
                                    <Text style={styles.acceptText}>Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <Text style={styles.footerText}>Prices are final. No hidden fees.</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    driverCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    driverProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    driverDetails: {
        justifyContent: 'center',
    },
    driverName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
    },
    dot: {
        marginHorizontal: 6,
        color: '#9CA3AF',
        fontSize: 12,
    },
    carModel: {
        fontSize: 12,
        color: '#6B7280',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    offeredText: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeTag: {
        backgroundColor: '#F0FDFA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    timeTagText: {
        color: '#0F766E',
        fontSize: 12,
        fontWeight: '700',
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    declineButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 8,
    },
    declineText: {
        color: '#6B7280',
        fontWeight: '700',
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: '#111827',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    acceptText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    footerText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 20,
    }
});

export default DriverOffersScreen;
