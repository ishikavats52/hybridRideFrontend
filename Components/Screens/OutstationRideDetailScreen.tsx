import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faStar,
    faCircle,
    faSquare,
    faChair,
    faCar
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getImageUrl } from '../../Services/apiClient';
import { Image, Alert, ActivityIndicator } from 'react-native';
import poolService from '../../Services/poolService';

const { width } = Dimensions.get('window');

const OutstationRideDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { rideData, mode, fromLocation, toLocation, date, seats } = route.params as any || {};


    const isPooling = mode === 'POOLING';
    const ride = rideData?.fullData || {};
    const mainName = isPooling ? `${ride.host?.name || 'Driver'}'s Ride` : `${ride.host?.name || rideData?.provider || 'Provider'}'s Ride`;
    const subText = isPooling ? (ride.host?.driverDetails?.vehicle?.model || 'Car') : (ride.host?.driverDetails?.vehicle?.model || rideData?.type || 'Vehicle');
    const initial = isPooling ? (ride.host?.name?.charAt(0) || 'D') : (ride.host?.name?.charAt(0) || rideData?.provider?.charAt(0) || 'P');
    const [loading, setLoading] = React.useState(false);
    const profileImage = ride.host?.profileImage;

    return (
        <View style={styles.container}>
            {/* Header Gradient Placeholder (using View for now) */}
            <View style={styles.headerBackground}>
                <SafeAreaView>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <FontAwesomeIcon icon={faArrowLeft} size={20} color="#111827" />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <View style={styles.contentContainer}>
                {/* Driver/Provider Header */}
                <View style={styles.profileRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.mainName}>{mainName}</Text>
                        <View style={styles.subInfoRow}>
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeText}>{subText}</Text>
                            </View>
                            <Text style={styles.bulletPoint}>•</Text>
                            <FontAwesomeIcon icon={faStar} size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                            <Text style={styles.ratingText}>{rideData?.driver?.rating || rideData?.rating || '4.9'}</Text>
                        </View>
                    </View>
                    <View style={styles.avatar}>
                        {profileImage ? (
                            <Image source={{ uri: getImageUrl(profileImage) || '' }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{initial}</Text>
                        )}
                    </View>
                </View>

                {/* Ride Card */}
                <View style={styles.card}>
                    {/* Time Row */}
                    <View style={styles.timeRow}>
                        <View>
                            <Text style={styles.largeTime}>
                                {isPooling ? new Date(ride.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
                            </Text>
                            <Text style={styles.timeLabel}>DEPARTURE</Text>
                        </View>

                        <View style={styles.durationContainer}>
                            <Text style={styles.durationText}>
                                {ride.route?.duration ? `${Math.floor(ride.route.duration / 60)}h ${ride.route.duration % 60}m` : '3h 30m'}
                            </Text>
                            <View style={styles.durationLine} />
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.largeTime}>
                                {isPooling ? 'Scheduled' : 'Doorstep'}
                            </Text>
                            <Text style={styles.timeLabel}>ARRIVAL</Text>
                        </View>
                    </View>

                    {/* Timeline */}
                    <View style={styles.timelineContainer}>
                        {/* Pickup */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineIconColumn}>
                                <FontAwesomeIcon icon={faCircle} size={12} color="#10B981" />
                                <View style={styles.dottedLine} />
                            </View>
                            <View style={styles.timelineTextColumn}>
                                <Text style={styles.timelineLabel}>PICKUP POINT</Text>
                                <Text style={styles.timelineValue}>{ride.origin?.name || fromLocation || 'Pickup Location'}</Text>
                            </View>
                        </View>

                        {/* Drop */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineIconColumn}>
                                <FontAwesomeIcon icon={faSquare} size={12} color="#111827" />
                            </View>
                            <View style={styles.timelineTextColumn}>
                                <Text style={styles.timelineLabel}>DROP POINT</Text>
                                <Text style={styles.timelineValue}>{ride.destination?.name || toLocation || 'Drop Location'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Seats Banner */}
                <View style={styles.banner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={isPooling ? faChair : faCar} size={16} color="#4B5563" style={{ marginRight: 12 }} />
                        <Text style={styles.bannerText}>Seat selection available</Text>
                    </View>
                    <Text style={styles.bannerRightText}>{ride.availableSeats || 4} LEFT</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                        {isPooling ? 'Price per seat' : 'Price per seat'}
                    </Text>
                    <Text style={styles.priceValue}>₹{ride.pricePerSeat || 35}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.confirmButton, loading && { opacity: 0.7 }]}
                    disabled={loading}
                    onPress={async () => {
                        if (isPooling) {
                            navigation.navigate('SeatPreference' as never, {
                                rideData: {
                                    ...rideData,
                                    type: 'POOLING',
                                    isOutstation: true,
                                    tripId: ride._id // Ensure tripId is passed
                                },
                                fromLocation,
                                toLocation,
                                date,
                                maxSeats: ride.availableSeats,
                                initialSeats: seats
                            } as never);
                        } else {
                            // Non-Pooling (Rentals)
                            setLoading(true);
                            try {
                                const totalSeatsToBook = ride.availableSeats || 4;
                                const response = await poolService.bookSeat(ride._id, totalSeatsToBook);

                                if (response.success) {
                                    const driverData = {
                                        name: ride.host?.name || rideData.provider || 'Provider',
                                        car: ride.host?.driverDetails?.vehicle?.model || rideData.type || 'Vehicle',
                                        initial: (ride.host?.name || rideData.provider || 'P').charAt(0),
                                        rating: ride.host?.driverDetails?.ratings?.average || rideData.rating || '4.8',
                                        price: rideData.price
                                    };

                                    navigation.navigate('PoolingSuccess' as never, {
                                        driver: driverData,
                                        rideData: { ...rideData, ...ride, type: 'RENTAL' },
                                        price: rideData.price,
                                        passengers: 'Full Car',
                                        status: 'REQUESTED', // Requirement says status should be REQUESTED for rentals
                                        mode: 'RENTAL',
                                        fromLocation,
                                        toLocation,
                                        date
                                    } as never);
                                } else {
                                    Alert.alert('Booking Failed', response.message || 'Could not request rental');
                                }
                            } catch (error: any) {
                                console.error("Rental booking error:", error);
                                Alert.alert('Error', error.response?.data?.message || 'Failed to request rental. Ensure you are logged in.');
                            } finally {
                                setLoading(false);
                            }
                        }
                    }}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.confirmButtonText}>
                            {isPooling ? 'Continue to Seat Selection' : 'Request Ride'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerBackground: {
        height: 120, // Reduced height since we don't have gradient
        backgroundColor: '#E5E7EB', // Placeholder gray
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    mainName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    bulletPoint: {
        marginHorizontal: 8,
        color: '#9CA3AF',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F59E0B',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#DBEAFE', // Light blue
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1E40AF',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    largeTime: {
        fontSize: 20,
        fontWeight: '900', // Heavy bold
        color: '#111827',
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
    },
    durationContainer: {
        alignItems: 'center',
        flex: 1, // Take up remaining space
        marginHorizontal: 12,
    },
    durationText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 4,
    },
    durationLine: {
        height: 1,
        backgroundColor: '#E5E7EB',
        width: '100%',
    },
    timelineContainer: {
        // paddingLeft: 4,
    },
    timelineItem: {
        flexDirection: 'row',
        height: 60, // Fixed height for alignment
    },
    timelineIconColumn: {
        alignItems: 'center',
        width: 24,
        marginRight: 16,
    },
    dottedLine: {
        width: 1,
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: '#E5E7EB',
        borderStyle: 'dotted', // React Native doesn't support 'dotted' heavily on Views like web, but dashed might work or just solid line
        height: '100%',
        marginVertical: 4,
    },
    timelineTextColumn: {
        flex: 1,
        paddingTop: -2,
    },
    timelineLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    timelineValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    banner: {
        backgroundColor: '#ECFDF5',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    bannerText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#065F46',
    },
    bannerRightText: {
        fontSize: 13,
        fontWeight: '800', // Extrabold
        color: '#059669',
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    confirmButton: {
        backgroundColor: '#111827',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});

export default OutstationRideDetailScreen;
