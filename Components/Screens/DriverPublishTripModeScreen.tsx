import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faBuilding, faMountain, faLock, faMotorcycle, faTruckPickup } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Context/AuthContext';

const DriverPublishTripModeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();

    // Derive vehicle type from driver profile
    const vehicleType = (user?.driverDetails?.vehicle?.type || '').toUpperCase();
    const isBikeOrAuto = vehicleType === 'BIKE' || vehicleType === 'AUTO';
    const vehicleLabel = vehicleType === 'BIKE' ? 'Bike' : vehicleType === 'AUTO' ? 'Auto' : null;

    const handleLockedPress = () => {
        Alert.alert(
            `${vehicleLabel} — City Only`,
            `${vehicleLabel} drivers can only offer City Pools (local routes under 100 km).\n\nOutstation and Rental pools require a Car or Traveller vehicle.`,
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faChevronLeft} size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CHOOSE MODE</Text>
            </View>

            {/* Amber banner for bike/auto drivers */}
            {isBikeOrAuto && (
                <View style={styles.vehicleBanner}>
                    <FontAwesomeIcon
                        icon={vehicleType === 'BIKE' ? faMotorcycle : faTruckPickup}
                        size={16} color="#F59E0B" style={{ marginRight: 8 }}
                    />
                    <Text style={styles.vehicleBannerText}>
                        {vehicleLabel} drivers can only publish City Pools (under 100 km)
                    </Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.content}>

                {/* City Pool — always available */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('DriverPublishCityPool' as never)}
                >
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <FontAwesomeIcon icon={faBuilding} size={24} color="#000000" />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>City Pool</Text>
                        <Text style={styles.cardDescription}>
                            Intra-city pooled routes. Perfect for daily commutes or local trips.
                        </Text>
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>LOCAL MATCHING</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Outstation Pool — locked for BIKE/AUTO */}
                <TouchableOpacity
                    style={[styles.card, isBikeOrAuto && styles.cardLocked]}
                    onPress={() => isBikeOrAuto
                        ? handleLockedPress()
                        : navigation.navigate('DriverPublishOutstationPool' as never)
                    }
                >
                    {isBikeOrAuto && (
                        <View style={styles.lockBadge}>
                            <FontAwesomeIcon icon={faLock} size={11} color="#9CA3AF" />
                            <Text style={styles.lockBadgeText}>Car only</Text>
                        </View>
                    )}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: isBikeOrAuto ? '#1F2937' : '#6366F1', shadowColor: isBikeOrAuto ? 'transparent' : '#6366F1' }]}>
                            <FontAwesomeIcon icon={faMountain} size={24} color={isBikeOrAuto ? '#374151' : '#FFFFFF'} />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, isBikeOrAuto && styles.textMuted]}>Outstation Pool</Text>
                        <Text style={[styles.cardDescription, isBikeOrAuto && { color: '#374151' }]}>
                            Long-distance routes between cities. Set your per-seat pricing.
                        </Text>
                        <View style={[styles.tagContainer, { borderColor: isBikeOrAuto ? '#1F2937' : '#6366F1' }]}>
                            <Text style={[styles.tagText, { color: isBikeOrAuto ? '#374151' : '#6366F1' }]}>
                                {isBikeOrAuto ? 'NOT AVAILABLE FOR YOUR VEHICLE' : 'INTER-CITY TRAVEL'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Outstation Rental — locked for BIKE/AUTO */}
                <TouchableOpacity
                    style={[styles.card, isBikeOrAuto && styles.cardLocked]}
                    onPress={() => isBikeOrAuto
                        ? handleLockedPress()
                        : navigation.navigate('DriverPublishOutstationRental' as never)
                    }
                >
                    {isBikeOrAuto && (
                        <View style={styles.lockBadge}>
                            <FontAwesomeIcon icon={faLock} size={11} color="#9CA3AF" />
                            <Text style={styles.lockBadgeText}>Car only</Text>
                        </View>
                    )}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: isBikeOrAuto ? '#1F2937' : '#F59E0B', shadowColor: isBikeOrAuto ? 'transparent' : '#F59E0B' }]}>
                            <FontAwesomeIcon icon={faMountain} size={24} color={isBikeOrAuto ? '#374151' : '#FFFFFF'} />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, isBikeOrAuto && styles.textMuted]}>Outstation Rental</Text>
                        <Text style={[styles.cardDescription, isBikeOrAuto && { color: '#374151' }]}>
                            Full vehicle rentals for outstation trips. Price per KM + night charges.
                        </Text>
                        <View style={[styles.tagContainer, { borderColor: isBikeOrAuto ? '#1F2937' : '#F59E0B' }]}>
                            <Text style={[styles.tagText, { color: isBikeOrAuto ? '#374151' : '#F59E0B' }]}>
                                {isBikeOrAuto ? 'NOT AVAILABLE FOR YOUR VEHICLE' : 'FULL TRIP • PER KM'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1E293B',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#2DD4BF', letterSpacing: 1 },
    vehicleBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 4,
        backgroundColor: '#1C1407',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#78350F',
    },
    vehicleBannerText: { color: '#F59E0B', fontSize: 13, fontWeight: '600', flex: 1 },
    content: { padding: 20 },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
        position: 'relative',
        overflow: 'hidden',
    },
    cardLocked: {
        backgroundColor: '#0D1117',
        borderColor: '#1F2937',
        opacity: 0.65,
    },
    lockBadge: {
        position: 'absolute',
        top: 16, right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    lockBadgeText: { color: '#6B7280', fontSize: 11, fontWeight: '700', marginLeft: 5 },
    iconContainer: { marginBottom: 16, alignItems: 'flex-start' },
    iconCircle: {
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: '#2DD4BF',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    cardContent: { alignItems: 'flex-start' },
    cardTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
    textMuted: { color: '#374151' },
    cardDescription: { fontSize: 14, color: '#94A3B8', lineHeight: 20, marginBottom: 16 },
    tagContainer: {
        borderWidth: 1, borderColor: '#2DD4BF',
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    },
    tagText: { color: '#2DD4BF', fontWeight: '800', fontSize: 10, letterSpacing: 1 },
});

export default DriverPublishTripModeScreen;
