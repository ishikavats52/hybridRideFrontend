import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faMagnifyingGlass,
    faCar,
    faTriangleExclamation,
    faCommentDots,
    faChevronRight,
    faFileInvoice,
    faShieldHalved,
    faCircleQuestion,
    faMessage
} from '@fortawesome/free-solid-svg-icons';
import BottomNavBar from '../Navigation/BottomNavBar';
import DriverBottomNavBar from '../Navigation/DriverBottomNavBar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../Context/AuthContext';
import poolService, { PoolRide } from '../../Services/poolService';
import { CONFIG } from '../../Constants/Config';

const { width } = Dimensions.get('window');

const SupportScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const isDriver = (route.params as any)?.mode === 'driver' || user?.role === 'driver';

    const [recentTrips, setRecentTrips] = React.useState<PoolRide[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const res = isDriver
                    ? await poolService.getDriverHistory()
                    : await poolService.getPassengerHistory();

                if (res.success && res.data) {
                    const sorted = res.data.sort((a: PoolRide, b: PoolRide) =>
                        new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
                    );
                    setRecentTrips(sorted.slice(0, 2));
                }
            } catch (error) {
                console.error('Failed to fetch support history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [isDriver]);

    const formatSupportDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = date.getDate();
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
    };

    const handleSOS = () => {
        Linking.openURL(`tel:${CONFIG.CALL_CENTER_PHONE}`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Spacer for Fixed Header */}
                    <View style={{ height: 250 }} />

                    {/* No Active Ride / Status Card */}
                    {/* <View style={styles.statusCard}>
                        <View style={styles.statusIconContainer}>
                            <FontAwesomeIcon icon={faCar} size={24} color="#374151" />
                        </View>
                        <Text style={styles.statusTitle}>No active ride right now</Text>
                        <Text style={styles.statusSubtitle}>
                            Select a past trip or browse support topics below for assistance.
                        </Text>
                    </View> */}

                    <View style={styles.sosButtonContainer}>
                        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
                            <View style={styles.sosIconCircle}>
                                <FontAwesomeIcon icon={faTriangleExclamation} size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.sosTextContainer}>
                                <Text style={styles.sosTitle}>EMERGENCY SOS</Text>
                                <Text style={styles.sosSubtitle}>Immediate help from our 24/7 safety team</Text>
                            </View>
                            <FontAwesomeIcon icon={faChevronRight} size={16} color="#FFFFFF" style={{ opacity: 0.6 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Recent Trips Header */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionHeader}>RECENT TRIPS</Text>
                        <TouchableOpacity onPress={() => navigation.navigate(isDriver ? 'DriverMyTrips' as never : 'PassengerMyTrips' as never)}>
                            <Text style={styles.viewAllText}>VIEW ALL HISTORY</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>Loading recent trips...</Text>
                    ) : recentTrips.length === 0 ? (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>No recent trips found.</Text>
                    ) : (
                        recentTrips.map((trip) => (
                            <View style={styles.tripCard} key={trip._id}>
                                <View style={styles.tripHeader}>
                                    <Text style={styles.tripDate}>{formatSupportDate(trip.scheduledTime)}</Text>
                                    <View style={[styles.tripStatusBadge, trip.status === 'cancelled' && { backgroundColor: '#FEE2E2' }]}>
                                        <Text style={[styles.tripStatusText, trip.status === 'cancelled' && { color: '#DC2626' }]}>
                                            {trip.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.tripRoute} numberOfLines={1}>
                                    {trip.origin.name.split(',')[0]} → {trip.destination.name.split(',')[0]}
                                </Text>
                                <View style={styles.tripFooter}>
                                    <View style={styles.tripCarInfo}>
                                        <View style={styles.carIconBox}>
                                            <Text style={styles.carIconText}>
                                                {trip.host?.name ? trip.host.name.charAt(0).toUpperCase() : 'H'}
                                            </Text>
                                        </View>
                                        <Text style={styles.carDetails} numberOfLines={1}>
                                            {trip.host?.name || 'Driver'} • {trip.host?.driverDetails?.vehicle?.make || 'Vehicle'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.reportButton}>
                                        <Text style={styles.reportButtonText}>
                                            {trip.status === 'cancelled'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}


                    {/* General Support */}
                    <Text style={[styles.sectionHeader, { marginTop: 24, marginBottom: 12 }]}>GENERAL SUPPORT</Text>

                    <View style={styles.menuCard}>
                        {/* <TouchableOpacity style={styles.menuItem}> */}
                            {/* <View style={styles.menuIconBox}>
                                <FontAwesomeIcon icon={faFileInvoice} size={20} color="#374151" />
                            </View> */}
                            {/* <View style={styles.menuContent}> */}
                                {/* <Text style={styles.menuTitle}>Payment &amp; Invoices</Text> */}
                                {/* <Text style={styles.menuSubtitle}>Refunds, receipts, wallet help</Text> */}
                            {/* </View> */}
                            {/* <FontAwesomeIcon icon={faChevronRight} size={14} color="#D1D5DB" /> */}
                        {/* </TouchableOpacity> */}
                        {/* <View style={styles.divider} /> */}

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuIconBox}>
                                <FontAwesomeIcon icon={faShieldHalved} size={20} color="#DC2626" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>Safety Center</Text>
                                <Text style={styles.menuSubtitle}>Community guidelines &amp; safety tools</Text>
                            </View>
                            <FontAwesomeIcon icon={faChevronRight} size={14} color="#D1D5DB" />
                        </TouchableOpacity>
                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuIconBox}>
                                <FontAwesomeIcon icon={faCircleQuestion} size={20} color="#DC2626" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>Frequently Asked Questions</Text>
                                <Text style={styles.menuSubtitle}>Find quick answers</Text>
                            </View>
                            <FontAwesomeIcon icon={faChevronRight} size={14} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    {/* App Feedback */}
                    <View style={[styles.menuCard, { marginTop: 24 }]}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuIconBox}>
                                <FontAwesomeIcon icon={faMessage} size={20} color="#374151" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>App Feedback</Text>
                            </View>
                            <FontAwesomeIcon icon={faChevronRight} size={14} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.versionText}>VERSION 2.4.0</Text>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            {/* Fixed Header */}
            <View style={styles.fixedHeader}>
                <SafeAreaView>
                    <View style={styles.headerTopRow}>
                        <View>
                            <Text style={styles.headerTitle}>Help &amp; Support</Text>
                            <Text style={styles.headerSubtitle}>How can we help you today?</Text>
                        </View>
                        <View style={styles.activeRideBadge}>
                            <Text style={styles.activeRideText}>NO ACTIVE RIDE</Text>
                        </View>
                    </View>

                    {/* <View style={styles.searchBar}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="#6B7280" style={{ marginRight: 12 }} />
                        <TextInput
                            placeholder="Search help topics..."
                            placeholderTextColor="#6B7280"
                            style={styles.searchInput}
                        />
                    </View> */}
                </SafeAreaView>
            </View>

            {isDriver ? (
                <DriverBottomNavBar activeTab="SUPPORT" />
            ) : (
                <BottomNavBar activeTab="SUPPORT" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111827', // Dark Blue
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        paddingBottom: 24,
        zIndex: 100,
        // paddingTop handled by SafeAreaView
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align top cause title is multiline-ish
        marginTop: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    activeRideBadge: {
        backgroundColor: '#1F2937', // Slightly lighter dark
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    activeRideText: {
        color: '#10B981', // Green layout from screenshot 1? Actually screenshot 1 looks Teal/Green text. Screenshot 2 looks teal background. Let's stick to screenshot 1 text color style.
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    searchBar: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12, // Visual height
        flexDirection: 'row',
        alignItems: 'center',
    },
    // searchInput: {
    //     flex: 1,
    //     color: '#FFFFFF',
    //     fontSize: 14,
    //     padding: 0, // Reset default padding
    // },
    statusCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statusIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    sosButtonContainer: {
        marginBottom: 24,
        marginTop: 0,
       },
    sosButton: {
        backgroundColor: '#DC2626', // Bright Red
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    sosIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sosTextContainer: {
        flex: 1,
    },
    sosTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: 4,
    },
    sosSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    viewAllText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#10B981',
        textTransform: 'uppercase',
    },
    tripCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    tripHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    tripDate: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    tripStatusBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tripStatusText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#4B5563',
    },
    tripRoute: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
    },
    tripFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tripCarInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    carIconBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    carIconText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#6B7280',
    },
    carDetails: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    reportButton: {
        // No background, just text
    },
    reportButtonText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#10B981',
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 8, // Inner padding is small, items have padding
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconBox: {
        width: 40,
        height: 40,
        // borderRadius: 12, // Icons in screenshot don't have distinct bg box, just icon. Actually some do. Let's keep it clean.
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 72, // Access visual indentation
    },
    versionText: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 10,
        fontWeight: '800',
        color: '#D1D5DB',
        letterSpacing: 1,
    }
});

export default SupportScreen;
