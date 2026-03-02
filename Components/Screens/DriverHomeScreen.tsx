import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCar,
    faChevronRight,
    faCalendarDays,
    faFolderOpen,
    faUser,
    faWallet,
    faHeadset,
    faToggleOff,
    faToggleOn,
    faCircle,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Context/AuthContext';
import { driverService } from '../../Services/driverService';
import { getActiveRide } from '../../Services/rideService';
import { getImageUrl } from '../../Services/apiClient';

const { width } = Dimensions.get('window');

const DriverHomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, logout, refetchUser } = useAuth();
    const [isOnline, setIsOnline] = useState(user?.driverDetails?.isOnline || false);
    const [isLoadingToggle, setIsLoadingToggle] = useState(false);

    // Auto-resume active ride logic (Driver side)
    useFocusEffect(
        useCallback(() => {
            const checkActive = async () => {
                // Skip auto-resume if coming back manually (e.g., via Back button)
                if ((route.params as any)?.manualReturn) {
                    return;
                }

                try {
                    const result = await getActiveRide();
                    if (result.success && result.data) {
                        const ride = result.data;
                        const status = ride.status;

                        // Only redirect if driver is assigned to this ride
                        if (ride.driver && ride.driver._id === user?._id) {
                            if (status === 'accepted' || status === 'arrived' || status === 'ongoing') {
                                (navigation as any).navigate('DriverRideNavigation', {
                                    bookingId: ride._id,
                                    passenger: ride.passenger,
                                    pickup: ride.pickup?.address,
                                    dropoff: ride.dropoff?.address,
                                    fare: ride.finalFare || ride.offeredFare,
                                    initialViewState: status === 'ongoing' ? 'DROP_OFF' : 'PICKUP'
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to check active ride (driver):', error);
                }
            };

            checkActive();
        }, [navigation, user])
    );

    // Sync local state with user state
    React.useEffect(() => {
        if (user?.driverDetails) {
            setIsOnline(user.driverDetails.isOnline || false);
        }
    }, [user]);

    const handleToggleStatus = async () => {
        if (isLoadingToggle) return;
        setIsLoadingToggle(true);
        try {
            await driverService.toggleStatus();
            await refetchUser();
            // Local state will update via useEffect
        } catch (error) {
            console.error('Failed to toggle status:', error);
            // Revert on error if needed, but easier to just rely on re-fetch
        } finally {
            setIsLoadingToggle(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.profileSection} onPress={() => navigation.navigate('DriverProfile' as never)}>
                        <View style={styles.avatar}>
                            {user?.profileImage ? (
                                <Image source={{ uri: getImageUrl(user.profileImage) || undefined }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                            ) : (
                                <Text style={styles.avatarText}>{getInitials(user?.name || 'Driver')}</Text>
                            )}
                        </View>
                        <View>
                            <Text style={styles.driverName}>{user?.name || 'Driver'}</Text>
                            <View style={styles.ratingRow}>
                                <View style={styles.ratingBadge}>
                                    <Text style={styles.ratingText}>{user?.driverDetails?.ratings?.average || '0.0'} ★</Text>
                                </View>
                                <Text style={styles.carInfo}>
                                    {user?.driverDetails?.vehicle?.model
                                        ? `${user.driverDetails.vehicle.make} ${user.driverDetails.vehicle.model}`
                                        : 'No Vehicle'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#6B7280' }]} />
                        <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <FontAwesomeIcon icon={faRightFromBracket} size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                {/* Earnings Card */}
                <TouchableOpacity style={styles.earningsCard} onPress={() => navigation.navigate('DriverEarnings' as never)}>
                    <View style={styles.earningsInfo}>
                        <Text style={styles.earningsLabel}>TODAY'S EARNINGS</Text>
                        <Text style={styles.earningsAmount}>₹{user?.driverDetails?.earnings || '0.00'}</Text>
                    </View>
                    <View style={styles.ridesInfo}>
                        <Text style={styles.ridesLabel}>RIDES</Text>
                        <View style={styles.ridesCountRow}>
                            <Text style={styles.ridesCount}>{user?.driverDetails?.ratings?.count || 0}</Text>
                            <FontAwesomeIcon icon={faChevronRight} size={12} color="#9CA3AF" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Action Cards */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#1E293B' }]}
                        onPress={() => navigation.navigate('DriverPublishTripMode' as never)}
                    >
                        <FontAwesomeIcon icon={faCalendarDays} size={24} color="#F87171" />
                        <Text style={styles.actionTitle}>Publish Trip</Text>
                        <Text style={styles.actionSubtitle}>LOCAL / LONG</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#1E293B' }]}
                        onPress={() => navigation.navigate('DriverMyTrips' as never)}
                    >
                        <FontAwesomeIcon icon={faFolderOpen} size={24} color="#FBBF24" />
                        <Text style={styles.actionTitle}>My Trips</Text>
                        <Text style={styles.actionSubtitle}>MANAGE</Text>
                    </TouchableOpacity>
                </View>

                {/* GO Button */}
                <View style={styles.goButtonContainer}>
                    <TouchableOpacity
                        style={styles.goButton}
                        onPress={() => navigation.navigate('DriverOnline' as never)}
                    >
                        <FontAwesomeIcon icon={faCircle} size={80} color="#2DD4BF" style={{ position: 'absolute', opacity: 0.2 }} />
                        <Text style={styles.goButtonText}>GO</Text>
                    </TouchableOpacity>
                    <Text style={styles.readyText}>{isOnline ? 'You are online' : 'Ready to drive?'}</Text>
                    <Text style={styles.readySubtext}>
                        {isOnline ? 'Waiting for ride requests...' : 'Go online to start receiving ride requests.'}
                    </Text>
                </View>

            </SafeAreaView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <FontAwesomeIcon icon={faCar} size={20} color="#111827" />
                    <Text style={[styles.navText, { color: '#111827' }]}>RIDES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => (navigation as any).navigate('Wallet', { mode: 'driver' })}>
                    <FontAwesomeIcon icon={faWallet} size={20} color="#9CA3AF" />
                    <Text style={styles.navText}>PAYMENTS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => (navigation as any).navigate('Support', { mode: 'driver' })}>
                    <FontAwesomeIcon icon={faHeadset} size={20} color="#9CA3AF" />
                    <Text style={styles.navText}>SUPPORT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('DriverProfile' as never)}>
                    <FontAwesomeIcon icon={faUser} size={20} color="#9CA3AF" />
                    <Text style={styles.navText}>PROFILE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark background
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    avatarText: {
        color: '#94A3B8',
        fontSize: 18,
        fontWeight: '700',
    },
    driverName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBadge: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    ratingText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    carInfo: {
        color: '#94A3B8',
        fontSize: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
        marginRight: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    logoutButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    earningsCard: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    earningsInfo: {
        flex: 1,
    },
    earningsLabel: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    earningsAmount: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
    },
    ridesInfo: {
        alignItems: 'flex-end',
    },
    ridesLabel: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    ridesCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ridesCount: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginRight: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    actionCard: {
        width: (width - 50) / 2,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        height: 120,
    },
    actionTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        marginTop: 12,
    },
    actionSubtitle: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    goButtonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    goButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 4,
        borderColor: '#2DD4BF',
    },
    goButtonOffline: {
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    goButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        zIndex: 10,
    },
    readyText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    readySubtext: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 250,
        lineHeight: 20,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginTop: 4,
        letterSpacing: 0.5,
    },
});

export default DriverHomeScreen;
