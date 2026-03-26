import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faCalendar,
    faFilter,
    faCar,
    faBus,
    faStar,
    faSnowflake,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavBar from '../Navigation/BottomNavBar';
import poolService from '../../Services/poolService';



const { width } = Dimensions.get('window');

const OutstationModesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { fromLocation, toLocation, fromCoords, toCoords, date, seats } = route.params as any || {};
    const [activeTab, setActiveTab] = useState<'POOLING' | 'RENTAL'>('POOLING');

    const [poolingOptions, setPoolingOptions] = useState<any[]>([]);
    const [rentalOptions, setRentalOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRides = async () => {
        setLoading(true);
        try {
            // Fetch Pooling
            const poolingResponse = await poolService.searchRides('outstation', date, fromCoords, toCoords);
            if (poolingResponse.success) {
                const pools = poolingResponse.data.map((t: any) => ({
                    id: t._id,
                    tripId: t._id,
                    type: t.vehicle || 'Outstation SUV',
                    rating: t.host?.driverDetails?.ratings?.average || 4.8,
                    driver: t.host?.name || `Driver ${t._id.slice(-4)}`,
                    price: t.pricePerSeat || 35,
                    depTime: new Date(t.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    arrTime: 'Flexible',
                    seatsLeft: t.availableSeats,
                    icon: faCar,
                    color: '#E0F2F1',
                    origin: t.origin?.name || fromLocation,
                    destination: t.destination?.name || toLocation,
                    fullData: t // Keep reference to original backend object
                }));
                setPoolingOptions(pools);
            }

            // Fetch Rentals (Using 'rental' type which backend maps to 'outstation')
            const rentalResponse = await poolService.searchRides('rental', date, fromCoords, toCoords);
            if (rentalResponse.success) {
                const rentals = rentalResponse.data.map((t: any) => ({
                    id: t._id,
                    tripId: t._id,
                    type: t.vehicle || 'Full Car Rental',
                    rating: t.host?.driverDetails?.ratings?.average || 5.0,
                    provider: t.host?.name || `Provider ${t._id.slice(-4)}`,
                    price: t.pricePerSeat || 15, // Provide the per-km price
                    tripType: 'PER KM',
                    features: ['Flexible DEP', 'Doorstep ARR', 'Private Vehicle'],
                    icon: t.totalSeats > 7 ? faBus : faCar,
                    color: t.totalSeats > 7 ? '#E3F2FD' : '#E0F2F1',
                    origin: t.origin?.name || fromLocation,
                    destination: t.destination?.name || toLocation,
                    fullData: t
                }));
                setRentalOptions(rentals);
            }
        } catch (error) {
            console.error("Error fetching outstation data:", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRides();
    }, [date]);

    const renderPoolingItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => (navigation as any).navigate('OutstationRideDetail', {
                rideData: item,
                mode: 'POOLING',
                fromLocation,
                toLocation,
                seats
            })}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <FontAwesomeIcon icon={item.icon} size={20} color="#000" />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.vehicleType}>{item.type}</Text>
                    <View style={styles.ratingRow}>
                        <FontAwesomeIcon icon={faStar} size={10} color="#F59E0B" style={{ marginRight: 4 }} />
                        <Text style={styles.ratingText}>{item.rating} • {item.driver}</Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                    <Text style={styles.priceLabel}>PER SEAT</Text>
                </View>
            </View>

            <View style={styles.timeContainer}>
                <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>{item.depTime}</Text>
                    <Text style={styles.timeLabel}>DEP</Text>
                </View>
                <View style={styles.routeLineContainer}>
                    <View style={styles.routeLine} />
                    <Text style={styles.routeLabel}>Direct Route</Text>
                </View>
                <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
                    <Text style={styles.timeText}>{item.arrTime}</Text>
                    <Text style={styles.timeLabel}>ARR</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.seatsLeft} LEFT • CHOOSE ROW</Text>
                </View>
                {item.type.includes('Tempo') && (
                    <View style={[styles.badge, { backgroundColor: 'transparent' }]}>
                        <FontAwesomeIcon icon={faSnowflake} size={14} color="#0EA5E9" style={{ marginRight: 4 }} />
                        <Text style={[styles.badgeText, { color: '#000' }]}>AC</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderRentalItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => (navigation as any).navigate('OutstationRideDetail', {
                rideData: item,
                mode: 'RENTAL',
                fromLocation,
                toLocation,
                seats
            })}

        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <FontAwesomeIcon icon={item.icon} size={20} color="#000" />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.vehicleType}>{item.type}</Text>
                    <View style={styles.ratingRow}>
                        <FontAwesomeIcon icon={faStar} size={10} color="#F59E0B" style={{ marginRight: 4 }} />
                        <Text style={styles.ratingText}>{item.rating} • {item.provider}</Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                    <Text style={styles.priceLabel}>{item.tripType}</Text>
                </View>
            </View>

            <View style={styles.timeContainer}>
                <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>Flexible</Text>
                    <Text style={styles.timeLabel}>DEP</Text>
                </View>
                <View style={styles.routeLineContainer}>
                    <View style={styles.routeLine} />
                    <Text style={styles.routeLabel}>Direct Route</Text>
                </View>
                <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
                    <Text style={styles.timeText}>Doorstep</Text>
                    <Text style={styles.timeLabel}>ARR</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.badge, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[styles.badgeText, { color: '#0284C7' }]}>Private Vehicle</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <SafeAreaView>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.dateText}>{date || '2026-02-20'}</Text>
                            <View style={styles.routeRow}>
                                <Text style={styles.routeText}>{fromLocation?.split(',')[0] || 'San Francisco'}</Text>
                                <FontAwesomeIcon icon={faArrowRight} size={12} color="#9CA3AF" style={{ marginHorizontal: 8 }} />
                                <Text style={styles.routeText}>{toLocation?.split(',')[0] || 'Los Angeles'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'POOLING' && styles.activeTab]}
                            onPress={() => setActiveTab('POOLING')}
                        >
                            <Text style={[styles.tabText, activeTab === 'POOLING' && styles.activeTabText]}>POOLING</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'RENTAL' && styles.activeTab]}
                            onPress={() => setActiveTab('RENTAL')}
                        >
                            <Text style={[styles.tabText, activeTab === 'RENTAL' && styles.activeTabText]}>RENTAL</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filter Bar */}
                    <View style={styles.filterBar}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.optionsCountText}>
                                {activeTab === 'POOLING' ? poolingOptions.length : rentalOptions.length}
                            </Text>
                            <Text style={styles.optionsLabelText}> options</Text>
                        </View>
                        <TouchableOpacity style={styles.filterButton}>
                            <Text style={styles.filterButtonText}>Filter</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={activeTab === 'POOLING' ? poolingOptions : rentalOptions}
                    renderItem={activeTab === 'POOLING' ? renderPoolingItem : renderRentalItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <BottomNavBar activeTab="RIDES" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    topSection: {
        backgroundColor: '#111827',
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#14B8A6', // Example teal/cyan color
    },
    tabText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#9CA3AF',
    },
    activeTabText: {
        color: '#111827',
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 16,
    },
    optionsCountText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#14B8A6',
    },
    optionsLabelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#374151',
        backgroundColor: '#1F2937',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    listContainer: {
        flex: 1,
        marginTop: -10, // overlap slightly? No, design looks separate.
        paddingTop: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Bottom nav space
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailsContainer: {
        flex: 1,
    },
    vehicleType: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginTop: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    timeBlock: {
        // alignItems: 'flex-start',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    timeLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '700',
        marginTop: 2,
    },
    routeLineContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    routeLine: {
        height: 2,
        backgroundColor: '#E5E7EB',
        width: '100%',
        marginBottom: 4,
    },
    routeLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
    },
});

export default OutstationModesScreen;
