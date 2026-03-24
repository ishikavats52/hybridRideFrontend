import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCreditCard,
    faPlus,
    faMobileScreenButton,
    faArrowRight,
    faBriefcase,
    faCarSide,
    faBolt,
    faWallet,
    faHeart,
    faCar,
    faMountainSun
} from '@fortawesome/free-solid-svg-icons';
import { faApple } from '@fortawesome/free-brands-svg-icons';
import BottomNavBar from '../Navigation/BottomNavBar';
import DriverBottomNavBar from '../Navigation/DriverBottomNavBar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../Context/AuthContext';
import poolService, { PoolRide } from '../../Services/poolService';
import { getDriverEarnings } from '../../Services/rideService';
import RazorpayCheckout from 'react-native-razorpay';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../Services/paymentService';
import { CONFIG } from '../../Constants/Config';

const WalletScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { user, refetchUser } = useAuth();
    const isDriver = route.params?.mode === 'driver' || user?.role === 'driver';

    const [balance, setBalance] = React.useState('0.00');
    const [recentActivity, setRecentActivity] = React.useState<PoolRide[]>([]);
    const [isLoadingActivity, setIsLoadingActivity] = React.useState(true);

    const formatActivityDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = date.getDate();
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${month} ${day} • ${hours}:${minutes} ${ampm}`;
    };

    React.useEffect(() => {
        if (isDriver) {
            const fetchBalance = async () => {
                try {
                    const res = await getDriverEarnings();
                    if (res.success && res.data) {
                        setBalance(parseFloat(res.data.currentBalance || 0).toFixed(2));
                    }
                } catch (error) {
                    console.error('Failed to fetch balance', error);
                }
            };
            fetchBalance();
        } else {
            setBalance(parseFloat(user?.walletBalance || 0).toFixed(2));
        }

        const fetchHistory = async () => {
            try {
                setIsLoadingActivity(true);
                const res = isDriver
                    ? await poolService.getDriverHistory()
                    : await poolService.getPassengerHistory();

                if (res.success && res.data) {
                    const completed = res.data.filter((r: PoolRide) => r.status === 'completed');
                    const sorted = completed.sort((a: PoolRide, b: PoolRide) =>
                        new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
                    );
                    setRecentActivity(sorted.slice(0, 3));
                }
            } catch (error) {
                console.error('Failed to fetch activity history', error);
            } finally {
                setIsLoadingActivity(false);
            }
        };
        fetchHistory();
    }, [isDriver, user?.walletBalance]);

    const handleAddMoney = async () => {
        try {
            const amount = 500; // Fixed quick-add amount for concept
            const orderRes = await createRazorpayOrder(amount);

            if (!orderRes.success) {
                Alert.alert('Error', 'Failed to generate order');
                return;
            }

            const options = {
                description: 'Wallet Top-up',
                currency: 'INR',
                key: CONFIG.RAZORPAY_KEY_ID,
                amount: amount * 100,
                name: 'Sanchari',
                order_id: orderRes.order.id,
                prefill: {
                    contact: user?.phone || '9999999999',
                    name: user?.name || 'User'
                },
                theme: { color: '#059669' }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                const verifyRes = await verifyRazorpayPayment(
                    data.razorpay_order_id,
                    data.razorpay_payment_id,
                    data.razorpay_signature,
                    amount
                );
                if (verifyRes.success) {
                    await refetchUser();
                    Alert.alert('Success', '₹500 added to wallet successfully!');
                }
            }).catch((error: any) => {
                Alert.alert('Cancelled', 'Payment was cancelled or failed.');
            });
        } catch (e) {
            console.error('Payment Init Error:', e);
            Alert.alert('Error', 'Payment gateway failed to initialize.');
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { paddingHorizontal: 20 }]}>
                    <Text style={styles.headerTitle}>Wallet</Text>
                    <Text style={styles.headerSubtitle}>Manage your payment methods</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Balance Card */}
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>SANCHARI CASH BALANCE</Text>
                        <Text style={styles.balanceAmount}>₹{balance}</Text>
                        <TouchableOpacity
                            style={styles.addMoneyButton}
                            onPress={handleAddMoney}
                        >
                            <FontAwesomeIcon icon={faPlus} size={12} color="#111827" style={{ marginRight: 8 }} />
                            <Text style={styles.addMoneyText}>Add ₹500</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Recommended Offers */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionHeader}>Recommended Offers</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>VIEW ALL</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.offersScroll}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            flexDirection: 'row'
                        }}
                    >
                        {/* Offer 1 */}
                        <View style={styles.offerCard}>
                            <View style={styles.offerIconContainer}>
                                <FontAwesomeIcon icon={faBriefcase} size={20} color="#92400E" />
                            </View>
                            <Text style={styles.offerType}>CITY COMMUTE</Text>
                            <Text style={styles.offerTitle}>Weekday Office Route</Text>
                            <Text style={styles.offerDesc}>Save 10% on your morning commute to Tech Park.</Text>
                            <TouchableOpacity style={styles.learnMoreRow}>
                                <Text style={styles.learnMoreText}>LEARN MORE</Text>
                                <FontAwesomeIcon icon={faArrowRight} size={10} color="#2563EB" />
                            </TouchableOpacity>
                        </View>

                        {/* Offer 2 */}
                        <View style={styles.offerCard}>
                            <View style={[styles.offerIconContainer, { backgroundColor: '#FEF3C7' }]}>
                                <FontAwesomeIcon icon={faMountainSun} size={20} color="#B45309" />
                            </View>
                            <Text style={styles.offerType}>INTER-CITY</Text>
                            <Text style={styles.offerTitle}>Shared-Ride Savings</Text>
                            <Text style={[styles.offerDesc, { height: 'auto' }]}>Planning a long weekend? Book shared rides and save up to ₹45.</Text>
                            <TouchableOpacity style={styles.learnMoreRow}>
                                <Text style={[styles.learnMoreText, { color: '#9333EA' }]}>CHECK AVAILABILITY</Text>
                                <FontAwesomeIcon icon={faArrowRight} size={10} color="#9333EA" />
                            </TouchableOpacity>
                        </View>

                        
                    </ScrollView>

                    {/* Ride Savings */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionHeader}>Your Ride Savings</Text>
                        <TouchableOpacity style={styles.dateFilter}>
                            <Text style={styles.dateFilterText}>OCT 2023</Text>
                            {/* Chevron down icon could go here */}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.savingsCard}>
                        <Text style={styles.monthlySummaryLabel}>MONTHLY SUMMARY</Text>
                        <Text style={styles.totalSavings}>₹480.00</Text>
                        <View style={styles.percentageBadge}>
                            <Text style={styles.percentageText}>+24% from last month</Text>
                        </View>

                        {/* Breakdown */}
                        <View style={styles.savingsBreakdownItem}>
                            <View style={styles.savingsIconContainer}>
                                <FontAwesomeIcon icon={faHeart} size={16} color="#F59E0B" />
                            </View>
                            <View style={styles.savingsInfo}>
                                <Text style={styles.savingsTitle}>Shared Rides</Text>
                                <Text style={styles.savingsSubtitle}>Pooling with neighbors</Text>
                            </View>
                            <Text style={styles.savingsAmount}>₹320.00</Text>
                        </View>

                        <View style={styles.savingsBreakdownItem}>
                            <View style={styles.savingsIconContainer}>
                                <FontAwesomeIcon icon={faCarSide} size={16} color="#DC2626" />
                            </View>
                            <View style={styles.savingsInfo}>
                                <Text style={styles.savingsTitle}>Route Matching</Text>
                                <Text style={styles.savingsSubtitle}>Optimized trip planning</Text>
                            </View>
                            <Text style={styles.savingsAmount}>₹160.00</Text>
                        </View>
                    </View>

                    {/* Today's Savings */}
                    <Text style={[styles.sectionHeaderSmall, { marginTop: 24 }]}>TODAY'S SAVINGS</Text>
                    <View style={styles.todaySavingsRow}>
                        <View style={styles.todaySavingsLeft}>
                            <FontAwesomeIcon icon={faCar} size={14} color="#DC2626" style={{ marginRight: 10 }} />
                            <Text style={styles.todaySavingsTitle}>Office Ride</Text>
                        </View>
                        <Text style={styles.todaySavingsAmountNegative}>-₹12.00</Text>
                    </View>
                    <View style={[styles.todaySavingsRow, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
                        <View style={styles.todaySavingsLeft}>
                            <FontAwesomeIcon icon={faHeart} size={14} color="#059669" style={{ marginRight: 10 }} />
                            <Text style={[styles.todaySavingsTitle, { color: '#065F46' }]}>Shared Saving</Text>
                        </View>
                        <Text style={[styles.todaySavingsAmountPositive, { color: '#059669' }]}>+₹4.00</Text>
                    </View>


                    {/* Payment Methods */}
                    <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
                        <Text style={styles.sectionHeader}>Payment Methods</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>EDIT</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.paymentMethodsContainer}>
                        {/* Card 1 */}
                        <View style={styles.paymentMethodRow}>
                            <View style={styles.paymentIconBox}>
                                <FontAwesomeIcon icon={faCreditCard} size={20} color="#374151" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.paymentTitle}>Primary Card</Text>
                                <Text style={styles.paymentSubtitle}>**** 4242</Text>
                            </View>
                            <View style={styles.primaryBadge}>
                                <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                            </View>
                        </View>

                        {/* Divider */}
                        {/* <View style={styles.divider}/> */}
                        {/* Card 2 */}
                        <View style={[styles.paymentMethodRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                            <View style={styles.paymentIconBox}>
                                <FontAwesomeIcon icon={faMobileScreenButton} size={20} color="#374151" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.paymentTitle}>Apple Pay</Text>
                                <Text style={styles.paymentSubtitle}>Linked</Text>
                            </View>
                        </View>
                    </View>

                    {/* Recent Activity */}
                    <Text style={[styles.sectionHeader, { marginTop: 24, marginBottom: 12 }]}>Recent Activity</Text>

                    {isLoadingActivity ? (
                        <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 10 }}>Loading activity...</Text>
                    ) : recentActivity.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 10 }}>No recent transactions found.</Text>
                    ) : (
                        recentActivity.map((trip) => {
                            const isIncome = isDriver;
                            const amount = trip.pricePerSeat || 0;
                            return (
                                <View style={styles.activityRow} key={trip._id}>
                                    <View style={[styles.activityIconBox, { backgroundColor: isIncome ? '#ECFDF5' : '#FFF7ED' }]}>
                                        <FontAwesomeIcon icon={isIncome ? faPlus : faBolt} size={16} color={isIncome ? '#059669' : '#EA580C'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.activityTitle}>Ride {isIncome ? 'Income' : 'Payment'}</Text>
                                        <Text style={styles.activityDate}>{formatActivityDate(trip.scheduledTime)}</Text>
                                    </View>
                                    <Text style={isIncome ? styles.activityAmountPositive : styles.activityAmountNegative}>
                                        {isIncome ? '+' : '-'}₹{amount.toFixed(2)}
                                    </Text>
                                </View>
                            );
                        })
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {route.params?.mode === 'driver' ? (
                    <DriverBottomNavBar activeTab="PAYMENTS" />
                ) : (
                    <BottomNavBar activeTab="PAYMENTS" />
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10, // Reduced from 20
        paddingBottom: 20,
    },
    header: {
        marginBottom: 10, // Reduced from 24
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    balanceCard: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    balanceLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 20,
    },
    addMoneyButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
    },
    addMoneyText: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 14,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10B981',
        textTransform: 'uppercase',
    },
    offersScroll: {
        marginBottom: 32,
        // marginHorizontal: -20,
    },
    offerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        width: 260,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    offerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        flexDirection: 'row',
    },
    offerType: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    offerDesc: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 16,
        height: 36, // Fixed height for alignment
    },
    learnMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    learnMoreText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB',
        marginRight: 6,
    },
    dateFilter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateFilterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    savingsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        // marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        alignItems: 'center',
    },
    monthlySummaryLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    totalSavings: {
        fontSize: 32,
        fontWeight: '800',
        color: '#10B981', // Green
        marginBottom: 12,
    },
    percentageBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 24,
    },
    percentageText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#059669',
    },
    savingsBreakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        width: '100%',
    },
    savingsIconContainer: {
        width: 36,
        height: 36,
        // borderRadius: 18,
        // backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    savingsInfo: {
        flex: 1,
    },
    savingsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    savingsSubtitle: {
        fontSize: 11,
        color: '#6B7280',
    },
    savingsAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#059669',
    },
    sectionHeaderSmall: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    todaySavingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    todaySavingsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    todaySavingsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    todaySavingsAmountNegative: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    todaySavingsAmountPositive: {
        fontSize: 14,
        fontWeight: '700',
        color: '#059669',
    },
    paymentMethodsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    paymentIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    paymentSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    primaryBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    primaryBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#059669',
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    activityIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    activityDate: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
    },
    activityAmountNegative: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    activityAmountPositive: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10B981',
    },

});

export default WalletScreen;
