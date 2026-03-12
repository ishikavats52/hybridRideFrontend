import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    Alert,
    PermissionsAndroid
} from 'react-native';
import BottomNavBar from '../Navigation/BottomNavBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faLocationCrosshairs,
    faBriefcase,
    faMountainSun,
    faUserGroup,
    faGraduationCap,
    faHouseUser,
    faShieldHalved,
    faUser,
    faLocationDot,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Context/AuthContext';
import { getActiveRide } from '../../Services/rideService';
import { GOOGLE_MAPS_API_KEY } from '../../Config/maps';
import axios from 'axios';
import GetLocation from 'react-native-get-location';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

// Polyfill for react-native-google-places-autocomplete
// @ts-ignore
navigator.geolocation = require('@react-native-community/geolocation');

import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

const { width, height } = Dimensions.get('window');

const PassengerHomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, logout } = useAuth();
    const [rideType, setRideType] = useState('CITY_RIDE');
    const [destinationFlexibility, setDestinationFlexibility] = useState('EXACT');
    const [isCheckingRide, setIsCheckingRide] = useState(false);
    const [pickupAddress, setPickupAddress] = useState('Current Location');
    const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
    const pickupRef = useRef<GooglePlacesAutocompleteRef>(null);

    const fetchCurrentLocation = async (isManual = false) => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);

                const isGranted = granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
                    granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

                if (!isGranted) {
                    if (isManual) {
                        Alert.alert("Permission Error", "Please allow location access in settings.");
                    }
                    return;
                }

                try {
                    await promptForEnableLocationIfNeeded({
                        interval: 10000,
                    });
                } catch (err) {
                    console.log("GPS Enable Prompt Error/Cancel:", err);
                }
            }

            const location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 30000,
            });

            const { latitude, longitude } = location;
            setPickupCoords([longitude, latitude]);

            // Fetch Address using axios like in the provided example
            const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    latlng: `${latitude},${longitude}`,
                    key: GOOGLE_MAPS_API_KEY
                }
            });

            if (res.data && res.data.results && res.data.results.length > 0) {
                const address = res.data.results[0].formatted_address;
                setPickupAddress(address);
                if (pickupRef.current) {
                    pickupRef.current.setAddressText(address);
                }
            } else {
                setPickupAddress('Current Location');
            }
        } catch (error: any) {
            console.log("Location Fetch Error:", error.code, error.message);
            if (isManual) {
                Alert.alert("Location Issue", error.message || "Could not fetch location.");
            }
        }
    };

    // Auto-fetch location on mount
    useFocusEffect(
        useCallback(() => {
            fetchCurrentLocation();
        }, [])
    );

    // Auto-resume active ride logic
    useFocusEffect(
        useCallback(() => {
            const checkActive = async () => {
                // Skip auto-resume if coming back manually (e.g., via Back button)
                if ((route.params as any)?.manualReturn) {
                    return;
                }

                setIsCheckingRide(true);
                try {
                    const result = await getActiveRide();
                    if (result.success && result.data) {
                        const ride = result.data;
                        const status = ride.status;

                        if (status === 'pending') {
                            navigation.navigate('FindingDriver' as never, { bookingId: ride._id } as never);
                        } else if (status === 'accepted' || status === 'arrived') {
                            navigation.navigate('DriverAccepted' as never, {
                                bookingId: ride._id,
                                driver: {
                                    name: ride.driver?.name || 'Driver',
                                    rating: ride.driver?.driverDetails?.ratings?.average || 4.8,
                                    trips: ride.driver?.driverDetails?.ratings?.count || 0,
                                    car: ride.driver?.driverDetails?.vehicle?.model || 'Vehicle',
                                    vehicleColor: ride.driver?.driverDetails?.vehicle?.color || 'Grey',
                                    vehicleType: ride.driver?.driverDetails?.vehicle?.type || 'Sedan',
                                    plateNumber: ride.driver?.driverDetails?.vehicle?.plateNumber || 'XX00 XX 0000',
                                    initial: (ride.driver?.name?.[0] || 'D').toUpperCase(),
                                    phone: ride.driver?.phone || '',
                                },
                            } as never);
                        } else if (status === 'ongoing') {
                            navigation.navigate('RideTracking' as never, {
                                bookingId: ride._id,
                                driver: {
                                    name: ride.driver?.name || 'Driver',
                                    car: ride.driver?.driverDetails?.vehicle?.model || 'Vehicle',
                                    initial: (ride.driver?.name?.[0] || 'D').toUpperCase(),
                                }
                            } as never);
                        }
                    }
                } catch (error) {
                    console.error('Failed to check active ride:', error);
                } finally {
                    setIsCheckingRide(false);
                }
            };

            checkActive();
        }, [navigation])
    );

    return (
        <View style={styles.container}>
            {/* Map Placeholder Background */}
            <View style={styles.mapBackground}>
                {/* Simulated Map Elements */}
                <View style={[styles.mapRoad, { top: 100, transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.mapRoad, { top: 300, transform: [{ rotate: '-15deg' }] }]} />
                <View style={[styles.mapPark, { top: 150, left: 50 }]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    {/* <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <FontAwesomeIcon icon={faRightFromBracket} size={20} color="#EF4444" />
                    </TouchableOpacity> */}

                    <View style={styles.rideTypeToggle}>
                        <TouchableOpacity
                            style={[styles.toggleButton, rideType === 'CITY_RIDE' && styles.activeToggle]}
                            onPress={() => setRideType('CITY_RIDE')}
                        >
                            <Text style={[styles.toggleText, rideType === 'CITY_RIDE' && styles.activeToggleText]}>City Ride</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, rideType === 'OUTSTATION' && styles.activeToggle]}
                            onPress={() => navigation.navigate('Outstation' as never)}
                        >
                            <Text style={[styles.toggleText, rideType === 'OUTSTATION' && styles.activeToggleText]}>Outstation</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Wallet Balance */}
                    <TouchableOpacity style={styles.walletBadge} onPress={() => navigation.navigate('Wallet' as never)}>
                        <Text style={styles.walletBalText}>₹{user?.walletBalance || 0}</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Sheet / Content Card */}
                <View style={styles.bottomSheet}>
                    <View style={styles.dragHandle} />

                    <View style={[styles.scrollContent, { flex: 1, overflow: 'visible' }]}>
                        <Text style={styles.greeting}>Good evening! Need a ride?</Text>

                        {/* Ride Input Card */}
                        <View style={[styles.rideInputCard, { zIndex: 999 }]}>
                            <View style={styles.timelineContainer}>
                                <View style={styles.timelineDotGreen} />
                                <View style={styles.timelineLine} />
                                <View style={styles.timelineSquareBlack} />
                            </View>
                            <View style={[styles.inputFields, { zIndex: 1000 }]}>
                                <View style={[styles.inputRow, { zIndex: 2000, flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={{ flex: 1, paddingRight: 40, zIndex: 3000 }}>
                                        <Text style={styles.inputLabel}>PICKUP</Text>
                                        <GooglePlacesAutocomplete
                                            ref={pickupRef}
                                            placeholder="Search Pickup"
                                            onPress={(data, details = null) => {
                                                if (details) {
                                                    setPickupAddress(data.description);
                                                    setPickupCoords([details.geometry.location.lng, details.geometry.location.lat]);
                                                }
                                            }}
                                            query={{
                                                key: GOOGLE_MAPS_API_KEY,
                                                language: 'en',
                                                components: 'country:in'
                                            }}
                                            fetchDetails={true}
                                            onFail={(error) => console.error('Autocomplete Error:', error)}
                                            keyboardShouldPersistTaps="handled"
                                            listUnderlayColor="transparent"
                                            textInputProps={{
                                                placeholderTextColor: '#9CA3AF',
                                            }}
                                            styles={{
                                                container: { flex: 0, overflow: 'visible' },
                                                textInput: {
                                                    fontSize: 16,
                                                    fontWeight: '700',
                                                    color: '#111827',
                                                    paddingVertical: 0,
                                                    height: 30,
                                                    backgroundColor: 'transparent',
                                                    marginLeft: -8
                                                },
                                                listView: {
                                                    position: 'absolute',
                                                    top: 40,
                                                    left: 0,
                                                    right: -40,
                                                    backgroundColor: '#FFF',
                                                    borderRadius: 12,
                                                    elevation: 1000,
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.1,
                                                    zIndex: 1000,
                                                }
                                            }}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.inlineTargetButton}
                                        onPress={() => fetchCurrentLocation(true)}
                                    >
                                        <FontAwesomeIcon icon={faLocationCrosshairs} size={20} color="#10B981" />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.divider, { zIndex: -1 }]} />
                                <TouchableOpacity style={[styles.inputRow, { zIndex: -1 }]} onPress={() => navigation.navigate('DropLocation' as never, {
                                    pickupAddress,
                                    pickupCoords
                                } as never)}>
                                    <Text style={styles.inputLabel}>DROP-OFF</Text>
                                    <Text style={styles.inputPlaceholder}>Search destination</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Special Offers */}
                        <Text style={styles.sectionHeader}>SPECIAL OFFERS FOR YOU</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            <View style={styles.offerCard}>
                                <View style={styles.offerIconContainer}>
                                    <FontAwesomeIcon icon={faBriefcase} size={24} color="#92400E" />
                                </View>
                                <View>
                                    <Text style={styles.offerTitle}>Workday Pass</Text>
                                    <Text style={styles.offerSubtitle}>Flat 10% off on all city rides</Text>
                                </View>
                            </View>
                            <View style={[styles.offerCard, { marginLeft: 12 }]}>
                                <View style={styles.offerIconContainer}>
                                    <FontAwesomeIcon icon={faMountainSun} size={24} color="#10B981" />
                                </View>
                                <View>
                                    <Text style={styles.offerTitle}>Weekend Getaway</Text>
                                    <Text style={styles.offerSubtitle}>Outstation rides at 15% off</Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Destination Flexibility */}
                        <Text style={styles.sectionHeader}>DESTINATION FLEXIBILITY</Text>
                        <View style={styles.flexibilityContainer}>
                            <TouchableOpacity
                                style={[styles.flexOption, destinationFlexibility === 'EXACT' && styles.activeFlexOption]}
                                onPress={() => setDestinationFlexibility('EXACT')}
                            >
                                <Text style={[styles.flexTitle, destinationFlexibility === 'EXACT' && styles.activeFlexTitle]}>EXACT</Text>
                                <Text style={styles.flexSubtitle}>Low</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.flexOption, destinationFlexibility === '1KM' && styles.activeFlexOption]}
                                onPress={() => setDestinationFlexibility('1KM')}
                            >
                                <Text style={styles.flexTitle}>±1 KM</Text>
                                <Text style={styles.flexSubtitle}>Med</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.flexOption, destinationFlexibility === '10MIN' && styles.activeFlexOption]}
                                onPress={() => setDestinationFlexibility('10MIN')}
                            >
                                <Text style={styles.flexTitle}>±10 MIN</Text>
                                <Text style={styles.flexSubtitle}>High</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Trust Score */}
                        <View style={styles.trustScoreContainer}>
                            <Text style={styles.trustHeader}>TRUST SCORE NEARBY</Text>
                            <View style={styles.trustRow}>
                                <FontAwesomeIcon icon={faUser} size={12} color="#F59E0B" style={{ marginRight: 8 }} />
                                <Text style={styles.trustText}>Drivers nearby rated 4.8★+</Text>
                            </View>
                            <View style={styles.trustRow}>
                                <FontAwesomeIcon icon={faShieldHalved} size={12} color="#F59E0B" style={{ marginRight: 8 }} />
                                <Text style={styles.trustText}>Verified Government ID</Text>
                            </View>
                        </View>

                    </View>

                    {/* Fixed Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('DropLocation' as never, {
                            pickupAddress,
                            pickupCoords
                        } as never)}>
                            <Text style={styles.bookButtonText}>Book Ride</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Navigation Bar */}
                <BottomNavBar activeTab="RIDES" />

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    safeArea: {
        flex: 1,
    },
    mapBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#E5E7EB',
    },
    mapRoad: {
        position: 'absolute',
        width: '150%',
        height: 40,
        backgroundColor: '#FFFFFF',
        left: -50,
    },
    mapPark: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D1FAE5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    rideTypeToggle: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    toggleButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    activeToggle: {
        backgroundColor: '#111827',
    },
    toggleText: {
        fontWeight: '700',
        color: '#6B7280',
    },
    activeToggleText: {
        color: '#FFFFFF',
    },
    inlineTargetButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ECFDF5', // Light green background
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    walletBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        marginLeft: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 60,
        alignItems: 'center',
    },
    walletBalText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111827',
    },
    logoutButton: {
        position: 'absolute',
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 60, // Above bottom nav
        left: 0,
        right: 0,
        top: 150, // Start lower down
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 20,
    },
    rideInputCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 24,
    },
    timelineContainer: {
        marginRight: 16,
        alignItems: 'center',
        paddingTop: 8,
    },
    timelineDotGreen: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
        minHeight: 30,
    },
    timelineSquareBlack: {
        width: 12,
        height: 12,
        backgroundColor: '#111827',
        borderRadius: 2,
    },
    inputFields: {
        flex: 1,
    },
    inputRow: {
        paddingVertical: 4,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
        marginBottom: 4,
    },
    inputValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    inputPlaceholder: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '800',
        color: '#9CA3AF',
        marginBottom: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    horizontalScroll: {
        marginBottom: 24,
        flexDirection: 'row',
    },
    offerCard: {
        backgroundColor: '#EFF6FF', // Light blue
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        width: 250,
        marginRight: 12,
    },
    offerIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    offerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E3A8A', // Dark Blue
        marginBottom: 2,
    },
    offerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 12,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    flexibilityContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    flexOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    activeFlexOption: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    flexTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#9CA3AF',
        marginBottom: 2,
    },
    activeFlexTitle: {
        color: '#111827',
    },
    flexSubtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    trustScoreContainer: {
        backgroundColor: '#F0F9FF', // Very light blue
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    trustHeader: {
        fontSize: 10,
        fontWeight: '800',
        color: '#1D4ED8', // Blue
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    trustText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
    },
    bookButton: {
        backgroundColor: '#111827',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 10,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
    },
    activeNavText: {
        color: '#111827',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
});

export default PassengerHomeScreen;
