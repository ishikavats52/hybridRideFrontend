import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faCalendarDays, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CalendarModal from '../Common/CalendarModal';
import { getDriverEarnings } from '../../Services/rideService';


type Period = 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';



const DriverEarningsScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<Period>('TODAY');
    const [startDate, setStartDate] = useState('04-Feb-2026');
    const [endDate, setEndDate] = useState('02-Mar-2026');
    const [isCustomFetched, setIsCustomFetched] = useState(false);

    // Calendar Modal State
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    // Real data fetching state
    const [earningsData, setEarningsData] = useState<{
        [key in Period]: { total: string; trips: any[] }
    }>({
        TODAY: { total: "₹0.00", trips: [] },
        WEEK: { total: "₹0.00", trips: [] },
        MONTH: { total: "₹0.00", trips: [] },
        CUSTOM: { total: "₹0.00", trips: [] }
    });
    const [loading, setLoading] = useState(true);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const res = await getDriverEarnings();
            if (res.success && res.data) {
                const { today, week, month, total } = res.data;
                setEarningsData({
                    TODAY: { total: `₹${parseFloat(today).toFixed(2)}`, trips: [] },
                    WEEK: { total: `₹${parseFloat(week).toFixed(2)}`, trips: [] },
                    MONTH: { total: `₹${parseFloat(month).toFixed(2)}`, trips: [] },
                    CUSTOM: { total: `₹0.00`, trips: [] } // Custom would need a backend date filter
                });
            }
        } catch (error) {
            console.error('Failed to fetch earnings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    const currentData = earningsData[activeTab];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faChevronLeft} size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Earnings</Text>
                <TouchableOpacity style={styles.withdrawButton}>
                    <Text style={styles.withdrawText}>Withdraw</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Earnings Card */}
                <View style={styles.card}>
                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        {(['TODAY', 'WEEK', 'MONTH', 'CUSTOM'] as Period[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Custom Date Range Selector */}
                    {activeTab === 'CUSTOM' && (
                        <View style={styles.customDateContainer}>
                            <View style={styles.dateRow}>
                                <TouchableOpacity style={styles.dateInputWrapper} onPress={() => setShowStartCalendar(true)}>
                                    <Text style={styles.dateLabel}>START DATE</Text>
                                    <View style={styles.dateInput}>
                                        <Text style={styles.dateText}>{startDate}</Text>
                                        <FontAwesomeIcon icon={faCalendarDays} size={14} color="#111827" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.dateInputWrapper} onPress={() => setShowEndCalendar(true)}>
                                    <Text style={styles.dateLabel}>END DATE</Text>
                                    <View style={styles.dateInput}>
                                        <Text style={styles.dateText}>{endDate}</Text>
                                        <FontAwesomeIcon icon={faCalendarDays} size={14} color="#111827" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.fetchButton} onPress={() => setIsCustomFetched(true)}>
                                <Text style={styles.fetchButtonText}>Fetch Earnings</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Total Amount */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountText}>{currentData.total}</Text>
                        <Text style={styles.amountLabel}>{activeTab === 'CUSTOM' && isCustomFetched ? 'RANGE EARNINGS' : 'TOTAL EARNINGS'}</Text>
                    </View>
                </View>

                {/* Recent Trips List */}
                <Text style={styles.sectionTitle}>Recent Trips</Text>

                {loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Loading earnings...</Text>
                    </View>
                ) : currentData.trips.length > 0 ? (
                    currentData.trips.map((trip) => (
                        <View key={trip.id} style={styles.tripCard}>
                            <View style={styles.tripLeft}>
                                <Text style={styles.tripLocation}>{trip.location}</Text>
                                <Text style={styles.tripTime}>{trip.time}</Text>
                            </View>
                            <View style={styles.tripRight}>
                                <Text style={styles.tripAmount}>{trip.amount}</Text>
                                <Text style={styles.tripDetails}>{trip.details}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No trips found for this period.</Text>
                    </View>
                )}

            </ScrollView>

            {/* Modals */}
            <CalendarModal
                visible={showStartCalendar}
                onClose={() => setShowStartCalendar(false)}
                onSelectDate={setStartDate}
                selectedDate={startDate}
            />
            <CalendarModal
                visible={showEndCalendar}
                onClose={() => setShowEndCalendar(false)}
                onSelectDate={setEndDate}
                selectedDate={endDate}
            />

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
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    withdrawButton: {
        backgroundColor: '#E0F2F1', // Light Teal
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    withdrawText: {
        color: '#0D9488', // Darker Teal
        fontWeight: '700',
        fontSize: 14,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 6,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 18,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 14,
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    activeTabText: {
        color: '#111827',
        fontWeight: '700',
    },
    amountContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    amountText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 8,
    },
    amountLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
    },
    tripCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tripLeft: {
        flex: 1,
    },
    tripLocation: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    tripTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    tripRight: {
        alignItems: 'flex-end',
    },
    tripAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0D9488', // Teal
        marginBottom: 4,
    },
    tripDetails: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    customDateContainer: {
        marginTop: 20,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateInputWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    dateInput: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111827',
    },
    fetchButton: {
        backgroundColor: '#2DD4BF', // Teal
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    fetchButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },

});

export default DriverEarningsScreen;
