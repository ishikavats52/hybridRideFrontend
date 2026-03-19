import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faStar, faLock, faCreditCard, faMoneyBill, faCircleCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import { rateRide, updateRideStatus } from '../../Services/rideService';
import RazorpayCheckout from 'react-native-razorpay';

const { width } = Dimensions.get('window');

const RideCompletedScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'GATEWAY' | 'CASH'>('CASH');
    const { bookingId, driver, price } = route.params as any || {};

    const driverName = driver?.name || "Michael";
    const finalPrice = price || "13.00";

    const handlePayAndSettle = async () => {
        if (submitting) return;

        setSubmitting(true);
        try {
            // First submit rating if selected
            if (rating > 0 && bookingId) {
                await rateRide(bookingId, rating, "Great ride!");
            }

            if (paymentMethod === 'GATEWAY') {
                const options = {
                    description: `Payment for Ride ${bookingId || '123'}`,
                    image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', // Or some logo
                    currency: 'INR',
                    key: 'rzp_test_SL458wxzG3ZY4b',
                    amount: Math.round(parseFloat(finalPrice) * 100),
                    name: 'Hybrid Ride',
                    prefill: {
                        email: 'passenger@example.com',
                        contact: '9999999999',
                        name: driverName
                    },
                    theme: { color: '#10B981' }
                };

                const data = await RazorpayCheckout.open(options);
                console.log("Razorpay Success:", data.razorpay_payment_id);
                Alert.alert("Success", `Payment Completed: ${data.razorpay_payment_id}`);
            } else {
                Alert.alert("Success", "Cash payment confirmed with driver.");
            }

            // Mark booking as fully settled in backend
            if (bookingId) {
                await updateRideStatus(bookingId, 'completed');
            }

            // Navigate away on success
            navigation.navigate('PassengerHome' as never);
        } catch (error: any) {
            console.error('Settlement/Rating failed:', error);
            Alert.alert("Payment Cancelled", error.description || "Could not complete settlement.");
        } finally {
            setSubmitting(false);
        }
    };

    const getPayButtonText = () => {
        if (paymentMethod === 'CASH') return `Confirm Cash Paid (₹${finalPrice})`;
        return `Pay ₹${finalPrice} via Gateway`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.successIconContainer}>
                    <FontAwesomeIcon icon={faCheck} size={32} color="#10B981" />
                </View>
 
                {/* Title */}
                <Text style={styles.title}>Arrival Confirmed</Text>
                <Text style={styles.subtitle}>You have reached your destination safely.</Text>

                {/* Payment Card */}
                <View style={styles.paymentCard}>
                    <Text style={styles.amountLabel}>TOTAL PAYABLE AMOUNT</Text>
                    <Text style={styles.amountValue}>₹{finalPrice}</Text>

                    <View style={styles.separator} />

                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>PAYMENT STATUS</Text>
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingText}>• PENDING SETTLEMENT</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Selection */}
                <View style={styles.paymentSelection}>
                    <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'CASH' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('CASH')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <FontAwesomeIcon icon={faMoneyBill} size={20} color={paymentMethod === 'CASH' ? "#10B981" : "#6B7280"} />
                            <Text style={[styles.paymentOptionText, paymentMethod === 'CASH' && styles.paymentOptionTextSelected]}>Cash</Text>
                        </View>
                        <FontAwesomeIcon icon={paymentMethod === 'CASH' ? faCircleCheck : faCircle} size={20} color={paymentMethod === 'CASH' ? "#10B981" : "#D1D5DB"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'GATEWAY' && styles.paymentOptionSelected]}
                        onPress={() => setPaymentMethod('GATEWAY')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <FontAwesomeIcon icon={faCreditCard} size={20} color={paymentMethod === 'GATEWAY' ? "#10B981" : "#6B7280"} />
                            <Text style={[styles.paymentOptionText, paymentMethod === 'GATEWAY' && styles.paymentOptionTextSelected]}>Online Gateway</Text>
                        </View>
                        <FontAwesomeIcon icon={paymentMethod === 'GATEWAY' ? faCircleCheck : faCircle} size={20} color={paymentMethod === 'GATEWAY' ? "#10B981" : "#D1D5DB"} />
                    </TouchableOpacity>
                </View>

                {/* Rating Section */}
                <View style={styles.ratingSection}>
                    <Text style={styles.ratingTitle}>RATE YOUR JOURNEY WITH {driverName.toUpperCase()}</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <FontAwesomeIcon
                                    icon={faStar}
                                    size={32}
                                    color={star <= rating ? "#FBBF24" : "#E5E7EB"}
                                    style={styles.starIcon}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, submitting && { opacity: 0.7 }]}
                    onPress={handlePayAndSettle}
                    disabled={submitting}
                >
                    {submitting
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <Text style={styles.payButtonText}>{getPayButtonText()}</Text>
                    }
                </TouchableOpacity>

                <View style={styles.securityNote}>
                    <FontAwesomeIcon icon={faLock} size={12} color="#9CA3AF" style={{ marginRight: 6 }} />
                    <Text style={styles.securityText}>PAYMENT REQUIRED FOR FUTURE BOOKINGS</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ECFDF5', // Light green bg
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
    },
    paymentCard: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    amountLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 10,
    },
    amountValue: {
        fontSize: 48,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 20,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
    },
    pendingBadge: {
        backgroundColor: '#FFF7ED', // Light Orange
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    pendingText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#C2410C', // Dark Orange
    },
    paymentSelection: {
        width: '100%',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 12,
        alignSelf: 'center',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
    },
    paymentOptionSelected: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentOptionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5563',
        marginLeft: 12,
    },
    paymentOptionTextSelected: {
        color: '#10B981',
    },
    ratingSection: {
        alignItems: 'center',
    },
    ratingTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF', // Blue-ish gray similar to image
        letterSpacing: 1,
        marginBottom: 20,
    },
    starsRow: {
        flexDirection: 'row',
    },
    starIcon: {
        marginHorizontal: 8,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    payButton: {
        backgroundColor: '#111827', // Dark navy
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    securityText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.5,
    },
});

export default RideCompletedScreen;
