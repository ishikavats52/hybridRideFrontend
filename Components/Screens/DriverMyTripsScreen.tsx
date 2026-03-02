import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Alert, ActivityIndicator, Linking } from 'react-native';
import poolService from '../../Services/poolService';
import { faChevronLeft, faArrowRightLong, faUser, faPhone, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

type Tab = 'Upcoming' | 'Past';

const DriverMyTripsScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchDriverHistory = async () => {
            setLoading(true);
            try {
                const response = await poolService.getDriverHistory();

                if (response.success) {
                    // Map MongoDB keys to Component UI Keys
                    const mappedTrips = response.data.map((t: any) => ({
                        id: t._id,
                        date: new Date(t.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date(t.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        origin: t.origin?.name || 'Unknown',
                        destination: t.destination?.name || 'Unknown',
                        price: t.pricePerSeat ? `₹${t.pricePerSeat}` : '₹15',
                        bookedSeats: t.totalSeats - t.availableSeats,
                        totalSeats: t.totalSeats,
                        status: t.status, // Actual DB enum
                        tabStatus: t.status === 'scheduled' || t.status === 'ongoing' ? 'Upcoming' : 'Past',
                        passengers: t.passengers?.map((p: any) => ({
                            id: p.user?._id || Math.random().toString(),
                            name: p.user?.name || 'Passenger',
                            phone: p.user?.phone || 'N/A',
                            seats: p.seatsBooked || 1,
                            initial: p.user?.name?.charAt(0) || 'P',
                            color: '#10B981' // Hybrid Ride Green
                        })) || []
                    }));
                    setTrips(mappedTrips);
                }
            } catch (error) {
                console.error("Error fetching driver history:", error);
                Alert.alert("Error", "Could not fetch your trips");
            } finally {
                setLoading(false);
            }
        };

        fetchDriverHistory();
    }, []);

    // Simple mapping: 'Upcoming' includes scheduled/ongoing trips. 'Past' includes completed/cancelled trips.
    const currentTrips = trips.filter(trip => activeTab === trip.tabStatus);

    const updateTripStatus = async (tripId: string, action: string) => {
        try {
            setLoading(true);
            const response = await poolService.updateTripStatus(tripId, action);
            if (response.success) {
                // Refresh the list from backend to ensure consistent state
                const refreshResponse = await poolService.getDriverHistory();
                if (refreshResponse.success) {
                    const mappedTrips = refreshResponse.data.map((t: any) => ({
                        id: t._id,
                        date: new Date(t.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date(t.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        origin: t.origin?.name || 'Unknown',
                        destination: t.destination?.name || 'Unknown',
                        price: t.pricePerSeat ? `₹${t.pricePerSeat}` : '₹15',
                        bookedSeats: t.totalSeats - t.availableSeats,
                        totalSeats: t.totalSeats,
                        status: t.status, // Keep actual status ('scheduled', 'ongoing', 'completed', 'cancelled')
                        tabStatus: t.status === 'scheduled' || t.status === 'ongoing' ? 'Upcoming' : 'Past',
                        passengers: t.passengers?.map((p: any) => ({
                            id: p.user?._id || Math.random().toString(),
                            name: p.user?.name || 'Passenger',
                            phone: p.user?.phone || 'N/A',
                            seats: p.seatsBooked || 1,
                            initial: p.user?.name?.charAt(0) || 'P',
                            color: '#10B981'
                        })) || []
                    }));
                    setTrips(mappedTrips);
                }
                Alert.alert("Success", `Trip has been marked as ${action}.`);
            } else {
                Alert.alert("Error", "Could not update trip status.");
            }
        } catch (error: any) {
            console.error("Error updating trip status", error);
            Alert.alert("Error", error.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faChevronLeft} size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Trips</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('Upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
                    onPress={() => setActiveTab('Past')}
                >
                    <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>Past</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2DD4BF" style={{ marginTop: 50 }} />
                ) : currentTrips.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 50, color: '#6B7280' }}>No {activeTab.toLowerCase()} trips found.</Text>
                ) : currentTrips.map((trip) => {
                    const isExpanded = expandedTripId === trip.id;
                    const occupancyRate = (trip.bookedSeats / trip.totalSeats) * 100;

                    return (
                        <View key={trip.id} style={styles.tripCard}>
                            {/* Header: Date & Price */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setExpandedTripId(isExpanded ? null : trip.id)}
                            >
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.tripDateLabel}>SCHEDULED FOR</Text>
                                        <Text style={styles.tripDateValue}>{trip.date}</Text>
                                    </View>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.tripPrice}>{trip.price}</Text>
                                        <Text style={styles.perSeatText}>PER SEAT</Text>
                                    </View>
                                </View>

                                {/* Route */}
                                <View style={styles.routeRow}>
                                    <View style={styles.locationBlock}>
                                        <Text style={styles.locationText}>{trip.origin.split(',')[0]}</Text>
                                        <Text style={styles.regionText}>{trip.origin.split(',').slice(1).join(',') || 'Region'}</Text>
                                    </View>
                                    <View style={styles.arrowContainer}>
                                        <FontAwesomeIcon icon={faArrowRightLong} size={16} color="#10B981" />
                                    </View>
                                    <View style={styles.locationBlock}>
                                        <Text style={styles.locationText}>{trip.destination.split(',')[0]}</Text>
                                        <Text style={styles.regionText}>{trip.destination.split(',').slice(1).join(',') || 'Region'}</Text>
                                    </View>
                                </View>

                                {/* Progress / Occupancy */}
                                <View style={styles.occupancySection}>
                                    <View style={styles.occupancyLabelRow}>
                                        <Text style={styles.occupancyLabel}>Trip Occupancy</Text>
                                        <Text style={styles.occupancyValue}>{trip.bookedSeats} / {trip.totalSeats} Seats</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${occupancyRate}%` }]} />
                                    </View>
                                </View>

                                <View style={styles.toggleManifestRow}>
                                    <Text style={styles.toggleManifestText}>
                                        {isExpanded ? 'Hide Manifest' : 'View Passengers'}
                                    </Text>
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faChevronUp : faChevronDown}
                                        size={12}
                                        color="#64748B"
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Expandable Manifest */}
                            {isExpanded && (
                                <View style={styles.manifestContainer}>
                                    <View style={styles.manifestHeader}>
                                        <Text style={styles.manifestTitle}>Passenger Manifest</Text>
                                    </View>
                                    {trip.passengers.length > 0 ? (
                                        trip.passengers.map((p: any) => (
                                            <View key={p.id} style={styles.passengerRow}>
                                                <View style={[styles.passengerAvatar, { backgroundColor: p.color }]}>
                                                    <Text style={styles.pAvatarText}>{p.initial}</Text>
                                                </View>
                                                <View style={styles.pInfo}>
                                                    <Text style={styles.pName}>{p.name}</Text>
                                                    <Text style={styles.pSeats}>{p.seats} Seat{p.seats > 1 ? 's' : ''}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.pCallButton}
                                                    onPress={() => Linking.openURL(`tel:${p.phone}`)}
                                                >
                                                    <FontAwesomeIcon icon={faPhone} size={14} color="#10B981" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noPassengersText}>No seats booked yet.</Text>
                                    )}
                                </View>
                            )}

                            {/* Actions */}
                            <View style={styles.actionRow}>
                                {activeTab === 'Upcoming' && (
                                    <>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => updateTripStatus(trip.id, 'cancelled')}>
                                            <Text style={styles.cancelButtonText}>Cancel Trip</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.startTripButton} onPress={() => updateTripStatus(trip.id, 'completed')}>
                                            <Text style={styles.startTripText}>Complete Trip</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                {activeTab === 'Past' && (
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {trip.status === 'cancelled' && (
                                            <View style={styles.cancelledBadge}>
                                                <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity style={[styles.viewDetailsButton, trip.status === 'cancelled' && { flex: 0, paddingHorizontal: 20 }]}>
                                            <Text style={styles.viewDetailsText}>View Trip Summary</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    tabContainer: {
        flexDirection: 'row',
        margin: 20,
        borderRadius: 12,
        padding: 4,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#F3F4F6', // Basic grey highlight for active tab in Simple view
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: '700',
    },
    content: {
        padding: 20,
        paddingTop: 10,
    },
    tripCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tripDate: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    tripPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    perSeatText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    arrowContainer: {
        marginHorizontal: 12,
    },
    seatInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    passengerAvatars: {
        flexDirection: 'row',
        paddingLeft: 4,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
        opacity: 0.7,
    },
    seatStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FEF2F2',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 14,
    },
    viewDetailsButton: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 10,
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    tripDateLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.5,
    },
    tripDateValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 2,
    },
    locationBlock: {
        flex: 1,
    },
    regionText: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    occupancySection: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    occupancyLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    occupancyLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    occupancyValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E293B',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 3,
    },
    toggleManifestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginBottom: 4,
    },
    toggleManifestText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginRight: 6,
    },
    manifestContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    manifestHeader: {
        marginBottom: 12,
    },
    manifestTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
    },
    passengerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 10,
        marginBottom: 8,
    },
    passengerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pAvatarText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    pInfo: {
        flex: 1,
        marginLeft: 12,
    },
    pName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    pSeats: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 1,
    },
    pCallButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0FDF4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noPassengersText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#94A3B8',
        fontStyle: 'italic',
        paddingVertical: 10,
    },
    startTripButton: {
        flex: 1,
        backgroundColor: '#1E293B',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    startTripText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    cancelledBadge: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cancelledBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#EF4444',
    }
});

export default DriverMyTripsScreen;
