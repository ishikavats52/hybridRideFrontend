import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faGear,
    faUser,
    faCheck,
    faChevronRight,
    faShieldHalved,
    faCircleCheck,
    faHeadphones,
    faLeaf,
    faClock,
    faWallet,
    faHouse,
    faBriefcase,
    faPlus,
    faPen,
    faHeart,
    faCamera,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import BottomNavBar from '../Navigation/BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import SettingsScreen from './SettingsScreen';
import { useAuth } from '../Context/AuthContext';
import { driverService } from '../../Services/driverService';
import { getImageUrl } from '../../Services/apiClient';
import poolService, { PoolRide } from '../../Services/poolService';

const { width } = Dimensions.get('window');

const PassengerProfileScreen = () => {
    const navigation = useNavigation();
    const { user, refetchUser, logout } = useAuth();
    const [rides, setRides] = useState<PoolRide[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRideTab, setActiveRideTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await poolService.getPassengerHistory();
            if (res.success) {
                setRides(res.data);
            }
        } catch (error) {
            console.error("Error fetching ride history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const mapStatus = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Upcoming';
            case 'ongoing': return 'Ongoing';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return 'Completed';
        }
    };

    const categorizedRides = {
        Upcoming: rides.filter(r => mapStatus(r.status) === 'Upcoming' || mapStatus(r.status) === 'Ongoing'),
        Completed: rides.filter(r => mapStatus(r.status) === 'Completed'),
        Cancelled: rides.filter(r => mapStatus(r.status) === 'Cancelled'),
    };

    const handleImagePick = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            if (uri) {
                // Upload immediately
                const formData = new FormData();
                formData.append('docType', 'profileImage');
                formData.append('document', {
                    uri: uri,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                } as any);

                try {
                    await driverService.uploadDocument(formData);
                    await refetchUser(); // Refresh user data to show new image
                    Alert.alert('Success', 'Profile image updated successfully');
                } catch (err: any) {
                    console.error("Failed to upload profile image:", err);
                    const errorMsg = err.response?.data?.message || err.message || 'Failed to update profile image';
                    Alert.alert('Error', errorMsg);
                }
            }
        }
    };

    // Calculate years dynamically
    const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
    const yearsActive = new Date().getFullYear() - memberSince + (new Date().getFullYear() === memberSince ? 0.5 : 0);
    const yearsDisplay = yearsActive < 1 ? '<1' : yearsActive.toString();

    // Profile Strength Calculation
    const calculateStrength = () => {
        let score = 0;
        if (user?.name) score += 20;
        if (user?.phone) score += 20;
        if (user?.email) score += 10;
        if (user?.profileImage) score += 10;
        if (user?.verificationStatus?.idCard) score += 20;
        if (user?.savedPlaces && user.savedPlaces.length > 0) score += 20;
        return Math.min(score, 100);
    };
    const profileStrength = calculateStrength();

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Spacer for Fixed Header */}
                    <View style={{ height: 320 }} />

                    {/* Profile Strength */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Profile Strength</Text>
                        <Text style={styles.percentageText}>{profileStrength}%</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${profileStrength}%` }]} />
                        </View>

                        <View style={styles.strengthItem}>
                            <View style={[styles.checkCircle, { backgroundColor: user?.phone ? '#D1FAE5' : '#F3F4F6' }]}>
                                <FontAwesomeIcon icon={faCheck} size={10} color={user?.phone ? "#10B981" : "#9CA3AF"} />
                            </View>
                            <Text style={styles.strengthText}>Phone {user?.phone ? 'Verified' : 'Pending'}</Text>
                        </View>

                        <View style={styles.strengthItem}>
                            <View style={[styles.checkCircle, { backgroundColor: user?.verificationStatus?.idCard ? '#D1FAE5' : '#FFFFFF', borderColor: user?.verificationStatus?.idCard ? 'transparent' : '#E5E7EB', borderWidth: user?.verificationStatus?.idCard ? 0 : 1 }]}>
                                {user?.verificationStatus?.idCard && <FontAwesomeIcon icon={faCheck} size={10} color="#10B981" />}
                            </View>
                            <Text style={styles.strengthText}>Add emergency contact</Text>
                            {!user?.verificationStatus?.idCard && (
                                <View style={styles.bonusBadge}>
                                    <Text style={styles.bonusText}>+15%</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Trust & Safety Center */}
                    <Text style={styles.sectionTitle}>Trust & Safety Center</Text>
                    <View style={styles.card}>
                        <View style={styles.trustHeader}>
                            <View style={styles.shieldIconBox}>
                                <FontAwesomeIcon icon={faShieldHalved} size={20} color="#059669" />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Trust Profile</Text>
                                <Text style={styles.cardSubtitle}>Verified profiles build better communities</Text>
                            </View>
                        </View>

                        <View style={styles.badgesRow}>
                            {user?.verificationStatus?.idCard && (
                                <View style={styles.verifiedBadge}>
                                    <FontAwesomeIcon icon={faCircleCheck} size={12} color="#059669" style={{ marginRight: 4 }} />
                                    <Text style={styles.verifiedText}>ID Verified</Text>
                                </View>
                            )}
                            {user?.phone && (
                                <View style={styles.verifiedBadge}>
                                    <FontAwesomeIcon icon={faCircleCheck} size={12} color="#059669" style={{ marginRight: 4 }} />
                                    <Text style={styles.verifiedText}>Phone Verified</Text>
                                </View>
                            )}
                        </View>

                        {user?.verificationStatus?.communityTrusted && (
                            <View style={[styles.verifiedBadge, { alignSelf: 'flex-start', backgroundColor: '#EFF6FF' }]}>
                                <FontAwesomeIcon icon={faCircleCheck} size={12} color="#2563EB" style={{ marginRight: 4 }} />
                                <Text style={[styles.verifiedText, { color: '#2563EB' }]}>Community Trusted</Text>
                            </View>
                        )}
                    </View>

                    {/* Ride Personality */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Ride Personality</Text>
                        <TouchableOpacity>
                            <Text style={styles.editText}>EDIT</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.subSectionTitle}>MY RIDE STYLE</Text>
                        <View style={[styles.tagsRow, { flexWrap: 'wrap' }]}>
                            {user?.ridePersonality && user.ridePersonality.length > 0 ? (
                                user.ridePersonality.map((tag, index) => (
                                    <View key={index} style={[styles.tag, { marginBottom: 8 }]}>
                                        <FontAwesomeIcon icon={faLeaf} size={14} color="#111827" style={{ marginRight: 6 }} />
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: '#9CA3AF', fontSize: 13 }}>No preferences set</Text>
                            )}
                        </View>
                    </View>

                    {/* Real Rides Dashboard */}
                    <Text style={styles.sectionTitle}>My Rides</Text>
                    <View style={styles.card}>
                        <View style={styles.rideTabs}>
                            {(['Upcoming', 'Completed', 'Cancelled'] as const).map(tab => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveRideTab(tab)}
                                    style={[styles.rideTab, activeRideTab === tab && styles.activeRideTab]}
                                >
                                    <Text style={[styles.rideTabText, activeRideTab === tab && styles.activeRideTabText]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.rideList}>
                            {categorizedRides[activeRideTab].length > 0 ? (
                                categorizedRides[activeRideTab].slice(0, 3).map((ride, idx) => (
                                    <View key={ride._id}>
                                        <TouchableOpacity
                                            style={styles.rideListItem}
                                            onPress={() => (navigation as any).navigate('PassengerMyTrips')}
                                        >
                                            <View style={styles.rideListInfo}>
                                                <Text style={styles.rideListRoute} numberOfLines={1}>
                                                    {ride.origin.name.split(',')[0]} → {ride.destination.name.split(',')[0]}
                                                </Text>
                                                <Text style={styles.rideListTime}>
                                                    {new Date(ride.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(ride.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                            <View style={styles.rideListPrice}>
                                                <Text style={styles.ridePriceText}>₹{ride.pricePerSeat}</Text>
                                                <FontAwesomeIcon icon={faChevronRight} size={10} color="#D1D5DB" />
                                            </View>
                                        </TouchableOpacity>
                                        {idx < Math.min(categorizedRides[activeRideTab].length, 3) - 1 && <View style={styles.rideDivider} />}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyRides}>
                                    <Text style={styles.emptyRidesText}>No {activeRideTab.toLowerCase()} rides found</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => (navigation as any).navigate('PassengerMyTrips')}
                        >
                            <Text style={styles.viewAllText}>View All History</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).navigate('Wallet')}>
                            <View style={[styles.menuIconCircle, { backgroundColor: '#ECFDF5' }]}>
                                <FontAwesomeIcon icon={faWallet} size={16} color="#059669" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuText}>Payment Methods</Text>
                            </View>
                            <Text style={styles.menuValue}>Hybrid Wallet</Text>
                            <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Travel Summary */}
                    {/* <Text style={styles.sectionTitle}>Your Travel Summary</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <FontAwesomeIcon icon={faHeart} size={20} color="#10B981" style={{ marginBottom: 8 }} />
                            <Text style={styles.summaryValue}>₹{user?.travelStats?.totalSavings || 0}</Text>
                            <Text style={styles.summaryLabel}>SHARED SAVINGS</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <FontAwesomeIcon icon={faLeaf} size={20} color="#B45309" style={{ marginBottom: 8 }} />
                            <Text style={[styles.summaryValue, { color: '#10B981' }]}>{user?.travelStats?.co2Saved || 0} kg</Text>
                            <Text style={styles.summaryLabel}>CO₂ SAVED</Text>
                        </View>
                    </View> */}

                    {/* Saved Places */}
                    {/* <Text style={styles.sectionTitle}>Saved Places</Text> */}
                    {/* <View style={styles.card}>
                        {user?.savedPlaces && user.savedPlaces.length > 0 ? (
                            user.savedPlaces.map((place, index) => (
                                <View key={index} style={[styles.placeItem, index > 0 && { marginTop: 16 }]}>
                                    <View style={styles.placeIconBox}>
                                        <FontAwesomeIcon icon={place.type === 'Home' ? faHouse : faBriefcase} size={16} color="#4B5563" />
                                    </View>
                                    <View style={styles.placeDetails}>
                                        <Text style={styles.placeTitle}>{place.label}</Text>
                                        <Text style={styles.placeAddress}>{place.address}</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <FontAwesomeIcon icon={faPen} size={12} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: '#9CA3AF', textAlign: 'center', marginVertical: 10 }}>No saved places</Text>
                        )}

                        <TouchableOpacity style={styles.addPlaceButton}>
                            <Text style={styles.addPlaceText}>+ Add New Place</Text>
                        </TouchableOpacity>
                    </View> */}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            {/* Fixed Header */}
            <View style={styles.fixedHeader}>
                <SafeAreaView>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <FontAwesomeIcon icon={faRightFromBracket} size={20} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingsButton} onPress={() => (navigation as any).navigate('Settings')}>
                        <FontAwesomeIcon icon={faGear} size={20} color="#4B5563" />
                    </TouchableOpacity>

                    <View style={styles.profileHeaderContent}>
                        <View style={styles.avatarContainer}>
                            {user?.profileImage ? (
                                <Image source={{ uri: getImageUrl(user.profileImage) || undefined }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                            ) : (
                                <FontAwesomeIcon icon={faUser} size={40} color="#9CA3AF" />
                            )}
                            <TouchableOpacity style={styles.cameraIconContainer} onPress={handleImagePick}>
                                <FontAwesomeIcon icon={faCamera} size={12} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user?.name || 'Passenger'}</Text>
                        <Text style={styles.userPhone}>{user?.phone || ''}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>5.0</Text>
                                <Text style={styles.statLabel}>RATING</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{rides.length}</Text>
                                <Text style={styles.statLabel}>RIDES</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{yearsDisplay}</Text>
                                <Text style={styles.statLabel}>YEARS</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <BottomNavBar activeTab="PROFILE" />
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
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingBottom: 30,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    settingsButton: {
        position: 'absolute',
        right: 20,
        top: 40, // Adjust based on safe area
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        zIndex: 10,
    },
    logoutButton: {
        position: 'absolute',
        left: 20,
        top: 40,
        padding: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 20,
        zIndex: 10,
    },
    profileHeaderContent: {
        alignItems: 'center',
        paddingTop: 10,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#ECFDF5', // Mint ring 
        position: 'relative',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10B981',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 38,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',

    },
    percentageText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#10B981',
    },
    editText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#10B981',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 12,
        marginTop: 12, // tight spacing
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressBarFill: {
        width: '80%',
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    strengthItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    strengthText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },
    bonusBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    bonusText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#6B7280',
    },
    trustHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    shieldIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    badgesRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
    },
    subSectionTitle: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    menuIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    menuValue: {
        fontSize: 14,
        color: '#9CA3AF',
        marginRight: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
        marginLeft: 48,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 6, // Gap
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#10B981',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
    },
    placeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    placeIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    placeDetails: {
        flex: 1,
    },
    placeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    placeAddress: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    addPlaceButton: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 8,
    },
    addPlaceText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    rideTabs: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rideTab: {
        marginRight: 20,
        paddingBottom: 8,
    },
    activeRideTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#10B981',
    },
    rideTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    activeRideTabText: {
        color: '#10B981',
    },
    rideList: {
        marginBottom: 12,
    },
    rideListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    rideListInfo: {
        flex: 1,
    },
    rideListRoute: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    rideListTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    rideListPrice: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ridePriceText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111827',
        marginRight: 8,
    },
    rideDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    viewAllButton: {
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2563EB',
    },
    emptyRides: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyRidesText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
});

export default PassengerProfileScreen;
