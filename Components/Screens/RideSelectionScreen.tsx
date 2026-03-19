import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faUser,
    faClock,
    faWallet,
    faCarSide,
    faMotorcycle,
    faUsers,
    faCar,
    faToiletPortable, // Using compatible icon for auto-rickshaw/similar if needed, or faCar
    faTruckPickup,
    faCalendarDays
} from '@fortawesome/free-solid-svg-icons';
import CalendarModal from '../Common/CalendarModal';
import TimePickerModal from '../Common/TimePickerModal';

const { width, height } = Dimensions.get('window');

const RideSelectionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pickupAddress, pickupCoords, dropoffAddress, dropoffCoords } = (route.params as any) || {};

    const [rideType, setRideType] = useState('POOLING'); // POOLING | INSTANT
    const [selectedRide, setSelectedRide] = useState('SHARE_CAR'); // Default for Pooling
    const [selectedDate, setSelectedDate] = useState('dd-mm-yyyy');
    const [selectedTime, setSelectedTime] = useState('hh:mm');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Reset selected ride when switching modes
    const handleRideTypeChange = (type: string) => {
        setRideType(type);
        if (type === 'POOLING') {
            setSelectedRide('SHARE_CAR');
        } else {
            setSelectedRide('DIRECT_CAR');
        }
    };

    const getConfirmText = () => {
        switch (selectedRide) {
            case 'SHARE_CAR': return 'Confirm 1 Share Car (₹7.50)';
            case 'BIKE_POOL': return 'Confirm Bike Pool (₹3.20)';
            case 'DIRECT_CAR': return 'Confirm Direct Car (₹12.50)';
            case 'AUTO': return 'Confirm Auto Rickshaw (₹6.80)';
            default: return 'Confirm';
        }
    };

    const handleConfirm = () => {
        if (selectedRide === 'BIKE_POOL') {
            // Skip seat preference for Bike
            (navigation as any).navigate('TripDetails', {
                rideData: { type: rideType, vehicle: selectedRide, price: 3.20 }, // Pass mock data or relevant params
                date: new Date().toISOString(),
                fromLocation: pickupAddress,
                toLocation: dropoffAddress
            });
        } else if (rideType === 'POOLING') {
            let isoDateString = new Date().toISOString();
            if (selectedDate !== 'dd-mm-yyyy' && selectedTime !== 'hh:mm') {
                const [day, monthStr, year] = selectedDate.split('-');
                const [time, period] = selectedTime.split(' ');
                let [hour, minute] = time.split(':');

                const monthMap: { [key: string]: number } = {
                    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
                };

                let h = parseInt(hour);
                if (period === 'PM' && h < 12) h += 12;
                if (period === 'AM' && h === 12) h = 0;

                const scheduledDateObj = new Date(parseInt(year), monthMap[monthStr], parseInt(day), h, parseInt(minute));
                isoDateString = scheduledDateObj.toISOString();
            }

            (navigation as any).navigate('AvailableRides', {
                rideData: { type: rideType, vehicle: selectedRide },
                date: isoDateString,
                fromLocation: pickupAddress,
                toLocation: dropoffAddress
            });
        } else {
            // Instant ride confirmation skips SeatPreference
            (navigation as any).navigate('TripDetails', {
                rideData: {
                    type: rideType,
                    vehicle: selectedRide,
                    price: selectedRide === 'DIRECT_CAR' ? 12.50 : 6.80
                },
                date: new Date().toISOString(),
                fromLocation: pickupAddress,
                toLocation: dropoffAddress
            });
        }
    };

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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={styles.backButtonCircle}>
                            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#111827" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Bottom Sheet */}
                <View style={styles.bottomSheet}>
                    <View style={styles.dragHandle} />

                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                rideType === 'POOLING' && styles.activeToggle
                            ]}
                            onPress={() => handleRideTypeChange('POOLING')}
                        >
                            <Text style={[styles.toggleText, rideType === 'POOLING' && styles.activeToggleText]}>POOLING</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                rideType === 'INSTANT' && styles.activeToggleInstant
                            ]}
                            onPress={() => handleRideTypeChange('INSTANT')}
                        >
                            <Text style={[styles.toggleText, rideType === 'INSTANT' && styles.activeToggleTextInstant]}>INSTANT</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        {/* POOLING CONTENT */}
                        {rideType === 'POOLING' && (
                            <>
                                {/* Seat Preference */}
                                <View style={styles.preferenceCard}>
                                    <View style={styles.preferenceLeft}>
                                        <View style={styles.iconContainerTeal}>
                                            <FontAwesomeIcon icon={faUser} size={18} color="#FFFFFF" />
                                        </View>
                                        <View>
                                            <Text style={styles.preferenceLabel}>SEAT PREFERENCE</Text>
                                            <Text style={styles.preferenceValue}>1 Passenger</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.changeButton} onPress={() => navigation.navigate('SeatPreference' as never)}>
                                        <Text style={styles.changeButtonText}>CHANGE ROW</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Date and Time Filters */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <TouchableOpacity style={[styles.preferenceCard, { flex: 1, marginRight: 6, marginBottom: 0, padding: 12 }]} onPress={() => setShowCalendar(true)}>
                                        <View style={styles.preferenceLeft}>
                                            <View style={styles.iconContainerTeal}>
                                                <FontAwesomeIcon icon={faCalendarDays} size={18} color="#FFFFFF" />
                                            </View>
                                            <View>
                                                <Text style={styles.preferenceLabel}>DATE</Text>
                                                <Text style={styles.preferenceValue}>{selectedDate}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.preferenceCard, { flex: 1, marginLeft: 6, marginBottom: 0, padding: 12 }]} onPress={() => setShowTimePicker(true)}>
                                        <View style={styles.preferenceLeft}>
                                            <View style={styles.iconContainerTeal}>
                                                <FontAwesomeIcon icon={faClock} size={18} color="#FFFFFF" />
                                            </View>
                                            <View>
                                                <Text style={styles.preferenceLabel}>TIME</Text>
                                                <Text style={styles.preferenceValue}>{selectedTime}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {/* Ride Options */}
                                <TouchableOpacity
                                    style={[styles.rideOption, selectedRide === 'SHARE_CAR' && styles.selectedRideOption]}
                                    onPress={() => setSelectedRide('SHARE_CAR')}
                                >
                                    <View style={styles.rideInfoLeft}>
                                        <View style={styles.rideIconContainer}>
                                            <FontAwesomeIcon icon={faUsers} size={24} color="#059669" />
                                        </View>
                                        <View>
                                            <Text style={styles.rideTitle}>Share Car</Text>
                                            <Text style={styles.rideSubtitle}>Up to 2 stops, save 40%</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rideInfoRight}>
                                        <Text style={styles.ridePrice}>₹7.50</Text>
                                        <View style={styles.etaContainer}>
                                            <Text style={styles.etaText}>6 MINS</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.rideOption, selectedRide === 'BIKE_POOL' && styles.selectedRideOption]}
                                    onPress={() => setSelectedRide('BIKE_POOL')}
                                >
                                    <View style={styles.rideInfoLeft}>
                                        <View style={styles.rideIconContainer}>
                                            <FontAwesomeIcon icon={faMotorcycle} size={24} color="#7C3AED" />
                                        </View>
                                        <View>
                                            <Text style={styles.rideTitle}>Bike Pool</Text>
                                            <Text style={styles.rideSubtitle}>Swift & eco-friendly</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rideInfoRight}>
                                        <Text style={styles.ridePrice}>₹3.20</Text>
                                        <View style={styles.etaContainer}>
                                            <Text style={styles.etaText}>3 MINS</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* INSTANT CONTENT */}
                        {rideType === 'INSTANT' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.rideOption, selectedRide === 'DIRECT_CAR' && styles.selectedRideOptionInstant]}
                                    onPress={() => setSelectedRide('DIRECT_CAR')}
                                >
                                    <View style={styles.rideInfoLeft}>
                                        <View style={styles.rideIconContainer}>
                                            <FontAwesomeIcon icon={faCar} size={24} color="#0891B2" />
                                        </View>
                                        <View>
                                            <Text style={styles.rideTitle}>Direct Car</Text>
                                            <Text style={styles.rideSubtitle}>Private door-to-door</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rideInfoRight}>
                                        <Text style={styles.ridePrice}>₹12.50</Text>
                                        <View style={styles.etaContainer}>
                                            <Text style={styles.etaText}>4 MINS</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.rideOption, selectedRide === 'AUTO' && styles.selectedRideOptionInstant]}
                                    onPress={() => setSelectedRide('AUTO')}
                                >
                                    <View style={styles.rideInfoLeft}>
                                        <View style={styles.rideIconContainer}>
                                            {/* Simulating Auto icon with similar shape or car for now */}
                                            <FontAwesomeIcon icon={faTruckPickup} size={24} color="#D97706" />
                                        </View>
                                        <View>
                                            <Text style={styles.rideTitle}>Auto Rickshaw</Text>
                                            <Text style={styles.rideSubtitle}>Open-air, beat traffic</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rideInfoRight}>
                                        <Text style={styles.ridePrice}>₹6.80</Text>
                                        <View style={styles.etaContainer}>
                                            <Text style={styles.etaText}>2 MINS</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Wallet */}
                        <View style={styles.walletContainer}>
                            <View style={styles.walletLeft}>
                                <FontAwesomeIcon icon={faWallet} size={20} color="#059669" style={{ marginRight: 12 }} />
                                <Text style={styles.walletText}>Hybrid Wallet</Text>
                            </View>
                            <TouchableOpacity style={styles.laterButton}>
                                <FontAwesomeIcon icon={faClock} size={14} color="#111827" style={{ marginRight: 6 }} />
                                <Text style={styles.laterText}>LATER</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>

                    {/* Confirm Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>{getConfirmText()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Modals placed outside main view tree overlay */}
                <CalendarModal
                    visible={showCalendar}
                    onClose={() => setShowCalendar(false)}
                    onSelectDate={setSelectedDate}
                    selectedDate={selectedDate === 'dd-mm-yyyy' ? '04-Feb-2026' : selectedDate}
                    disablePastDates={true}
                />
                <TimePickerModal
                    visible={showTimePicker}
                    onClose={() => setShowTimePicker(false)}
                    onSelectTime={setSelectedTime}
                    selectedTime={selectedTime === 'hh:mm' ? '12:00 PM' : selectedTime}
                />
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
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        marginBottom: 20,
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
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 10,
        height: '65%', // Adjust based on content
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for footer
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6', // Light gray bg
        borderRadius: 16,
        padding: 4,
        marginHorizontal: 20, // Add margin to align with content
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
    },
    activeToggle: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    activeToggleInstant: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#F59E0B', // Amber/Yellow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#9CA3AF',
    },
    activeToggleText: {
        color: '#111827',
    },
    activeToggleTextInstant: {
        color: '#111827',
    },
    preferenceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F0FDFA', // Light teal bg
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#CCFBF1',
    },
    preferenceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainerTeal: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#14B8A6', // Teal
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    preferenceLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#0D9488',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    preferenceValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    changeButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    changeButtonText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#059669',
    },
    rideOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB', // Default gray border
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    selectedRideOption: {
        borderColor: '#10B981', // Green border when selected (Pooling)
        backgroundColor: '#F0FDFA', // Very light green bg
        borderWidth: 2,
    },
    selectedRideOptionInstant: {
        borderColor: '#0891B2', // Cyan/Blue border when selected (Instant)
        backgroundColor: '#ECFEFF', // Very light cyan bg
        borderWidth: 2,
    },
    rideInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Allow text to wrap if needed
    },
    rideIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    rideTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    rideSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    rideInfoRight: {
        alignItems: 'flex-end',
    },
    ridePrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    etaContainer: {
        backgroundColor: '#ECFDF5',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    etaText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#059669',
    },
    walletContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 30, // Space before footer area implicitly
    },
    walletLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    walletText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    laterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    laterText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#374151',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    confirmButton: {
        backgroundColor: '#111827', // Dark navy/black
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
});

export default RideSelectionScreen;
