import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faArrowRight, faClock, faRulerCombined, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { Svg, Line, Circle, G } from 'react-native-svg';
import { getImageUrl } from '../../Services/apiClient';

const { width } = Dimensions.get('window');

const TripDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { fromLocation, toLocation, rideData, passengers, date } = (route.params as any) || {};

    // Mock Data
    const tripStats = {
        time: '24 min',
        distance: '13.2 km',
        minPrice: 24,
        maxPrice: 30,
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <View style={styles.backButtonCircle}>
                        <FontAwesomeIcon icon={faArrowLeft} size={20} color="#111827" />
                    </View>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Trip Details</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Route Visualizer */}
                <View style={styles.routeContainer}>
                    <Svg height="100" width={width * 0.8}>
                        {/* Dashed Line */}
                        <Line
                            x1="20"
                            y1="50"
                            x2={width * 0.8 - 20}
                            y2="80"
                            stroke="#111827"
                            strokeWidth="2"
                            strokeDasharray="5, 5"
                        />
                        {/* Start Point */}
                        <Circle cx="20" cy="50" r="8" fill="#14B8A6" />

                        {/* End Point */}
                        <G x={width * 0.8 - 30} y="70">
                            <View style={styles.endPointSquare} />
                        </G>
                        {/* Distance Label (Simulated centered) */}
                        <View style={styles.distanceBadge}>
                            <Text style={styles.distanceBadgeText}>{tripStats.distance}</Text>
                        </View>
                    </Svg>
                    {/* React Native Views for the markers since SVG G support is limited for non-svg children */}
                    <View style={[styles.marker, { top: 42, left: 12, backgroundColor: '#14B8A6', borderRadius: 8 }]} />
                    <View style={[styles.marker, { top: 72, right: 12, backgroundColor: '#111827', borderRadius: 2 }]} />

                    <View style={styles.distanceBadgeOverlay}>
                        <Text style={styles.distanceBadgeText}>{tripStats.distance}</Text>
                    </View>

                </View>

                {/* Content Card */}
                <View style={styles.card}>
                    <View style={styles.handle} />

                    <View style={styles.addressList}>
                        <View style={styles.addressItem}>
                            <View style={[styles.dot, { backgroundColor: '#14B8A6' }]} />
                            <Text style={styles.addressText} numberOfLines={1}>{fromLocation || 'Current Location'}</Text>
                        </View>
                        <View style={styles.addressLine} />
                        <View style={styles.addressItem}>
                            <View style={[styles.dot, { backgroundColor: '#111827' }]} />
                            <Text style={styles.addressText} numberOfLines={1}>{toLocation || 'Set Destination'}</Text>
                        </View>
                    </View>

                    <Text style={styles.cardTitle}>Estimate Fare</Text>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {/* Time */}
                        <View style={styles.statItem}>
                            <FontAwesomeIcon icon={faClock} size={24} color="#1F2937" />
                            <Text style={styles.statValue}>{tripStats.time}</Text>
                            <Text style={styles.statLabel}>Est. Time</Text>
                        </View>

                        {/* Distance */}
                        <View style={styles.statItem}>
                            <FontAwesomeIcon icon={faRulerCombined} size={24} color="#D97706" />
                            <Text style={styles.statValue}>{tripStats.distance}</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>

                        {/* Seats */}

                    </View>

                    {/* Pooling Review Details */}
                    {(route.params as any)?.rideData?.type === 'POOLING' ? (
                        <View style={{ width: '100%', marginBottom: 24 }}>
                            {/* Driver Info */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={{
                                    width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE',
                                    alignItems: 'center', justifyContent: 'center', marginRight: 16,
                                    overflow: 'hidden'
                                }}>
                                    {(route.params as any)?.rideData?.driver?.profileImage ? (
                                        <Image source={{ uri: getImageUrl((route.params as any).rideData.driver.profileImage) || undefined }} style={{ width: 48, height: 48 }} />
                                    ) : (
                                        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E40AF' }}>
                                            {((route.params as any)?.rideData?.driver?.name || 'D').charAt(0)}
                                        </Text>
                                    )}
                                </View>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                                        {(route.params as any)?.rideData?.driver?.name || 'Driver'}
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#6B7280' }}>
                                        {(route.params as any)?.rideData?.driver?.carModel || ((route.params as any)?.rideData?.type === 'POOLING' ? 'Vehicle Info' : (route.params as any)?.rideData?.type)}
                                    </Text>
                                </View>
                            </View>

                            {/* Departure Time */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12 }}>
                                <FontAwesomeIcon icon={faClock} size={16} color="#059669" style={{ marginRight: 8 }} />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46' }}>
                                    Departing at {(route.params as any)?.rideData?.time || (route.params as any)?.rideData?.depTime || 'Scheduled Time'}
                                </Text>
                            </View>

                            {/* Fixed Price Display */}
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.priceLabel}>TOTAL FARE</Text>
                                <Text style={styles.priceMain}>
                                    ₹{(route.params as any)?.calculatedPrice || (route.params as any)?.rideData?.price}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        /* Standard Price Range for Bidding */
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>RECOMMENDED FARE (TOTAL)</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceMain}>₹{tripStats.minPrice}</Text>
                                <Text style={styles.priceSeparator}>-</Text>
                                <Text style={styles.priceMain}>₹{tripStats.maxPrice}</Text>
                            </View>
                            <Text style={styles.priceDisclaimer}>
                                Based on current traffic, demand, and route distance.
                            </Text>
                        </View>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            // Check if it's a future date
                            // Assuming 'date' param is passed to this screen. 
                            // If missing, we assume Today for now, but in Outstation flow it should be passed.
                            // For this task, I'll access the route params which I need to add to the component.
                            const params = route.params as any || {};
                            const { date } = params;

                            console.log('TripDetailsScreen Params:', JSON.stringify(params, null, 2));
                            console.log('Received Date:', date);
                            // Parse the date string to check if it's truly in the future (tomorrow or later)
                            let isFuture = false;

                            if (date) {
                                const lowerDate = date.toLowerCase();
                                if (lowerDate.includes('today')) {
                                    isFuture = false;
                                } else {
                                    // Compare date parts
                                    const selectedDate = new Date(date);
                                    const todayDate = new Date();

                                    // Reset time components to compare only the date
                                    selectedDate.setHours(0, 0, 0, 0);
                                    todayDate.setHours(0, 0, 0, 0);

                                    // It is future if selected date is strictly greater than today
                                    isFuture = selectedDate.getTime() > todayDate.getTime();
                                }
                            }

                            if (isFuture) {
                                (navigation as any).navigate('OutstationScheduledScreen', {
                                    rideData: (route.params as any)?.rideData,
                                    date,
                                    fromLocation: (route.params as any)?.fromLocation
                                });
                            } else {
                                // Check if Pooling or Rental
                                const rideData = (route.params as any)?.rideData;
                                const mode = (route.params as any)?.mode;

                                if (rideData?.type === 'POOLING' || mode === 'RENTAL' || rideData?.type === 'RENTAL') {
                                    // Navigate to Tracking or Success directly, skipping OfferFare
                                    const calculatedPrice = (route.params as any)?.calculatedPrice || rideData?.price;

                                    // Construct Provider/Driver Data
                                    // For Rental: rideData has provider
                                    const isOutstation = rideData?.isOutstation || rideData?.type === 'RENTAL' || mode === 'RENTAL';
                                    const isRental = mode === 'RENTAL' || rideData?.type === 'RENTAL';

                                    const name = isRental ? (rideData.provider || 'Rental Provider') : (rideData.driver?.name || rideData.driverName || 'Driver');
                                    const car = isRental ? (rideData.type || 'Vehicle') : (rideData.driver?.carModel || rideData.carModel || rideData.type || 'Car');

                                    const driverData = {
                                        name: name,
                                        car: car,
                                        initial: name.charAt(0),
                                        rating: rideData.driver?.rating || rideData.rating || '4.9',
                                        price: calculatedPrice
                                    };

                                    // For Outstation Pooling, if it ever reaches here (it shouldn't if skipped), confirm it
                                    // For Rentals, it's "Request Ride" -> REQUESTED
                                    const nextStatus = (rideData?.type === 'POOLING' && rideData?.isOutstation) ? 'CONFIRMED' : (isOutstation ? 'REQUESTED' : 'CONFIRMED');

                                    (navigation as any).navigate('PoolingSuccess', {
                                        driver: driverData,
                                        rideData: { ...rideData, type: isRental ? 'RENTAL' : 'POOLING' },
                                        price: calculatedPrice,
                                        passengers: (route.params as any)?.passengers || (isRental ? 'Full' : 1),
                                        seatDistribution: (route.params as any)?.seatDistribution,
                                        status: nextStatus
                                    });
                                } else {
                                    (navigation as any).navigate('OfferFare');
                                }
                            }
                        }}
                    >
                        <Text style={styles.actionButtonText}>
                            {((route.params as any)?.rideData?.type === 'POOLING' || (route.params as any)?.mode === 'RENTAL')
                                ? ((route.params as any)?.rideData?.isOutstation && (route.params as any)?.rideData?.type === 'POOLING' ? 'Confirm Booking' : 'Request Ride')
                                : 'Set Your Price'}
                        </Text>
                        <FontAwesomeIcon icon={faArrowRight} size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                </View>

            </ScrollView>
        </SafeAreaView >
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
    backButton: {
        padding: 4,
    },
    backButtonCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitleContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
    },
    routeContainer: {
        height: 200,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    marker: {
        width: 16,
        height: 16,
        position: 'absolute',
    },
    endPointSquare: {
        width: 16,
        height: 16,
        backgroundColor: '#111827',
    },
    distanceBadge: {
        position: 'absolute',
        top: 40,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    distanceBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280',
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        alignItems: 'center',
        flex: 1, // Fill remaining space
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 32,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    statItem: {
        backgroundColor: '#F9FAFB',
        width: '45%',
        aspectRatio: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    statItemTeal: {
        backgroundColor: '#F0FDFA',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginTop: 12,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    priceContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    priceLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceMain: {
        fontSize: 40,
        fontWeight: '900',
        color: '#111827',
    },
    priceSeparator: {
        fontSize: 24,
        fontWeight: '400',
        color: '#9CA3AF',
        marginHorizontal: 12,
    },
    priceDisclaimer: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    actionButton: {
        backgroundColor: '#111827',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        marginRight: 12,
    },
    distanceBadgeOverlay: {
        position: 'absolute',
        top: 35,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    addressList: {
        width: '100%',
        marginBottom: 24,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    addressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
    addressLine: {
        width: 2,
        height: 20,
        backgroundColor: '#E5E7EB',
        marginLeft: 4,
        marginVertical: 2,
    }
});

export default TripDetailsScreen;
