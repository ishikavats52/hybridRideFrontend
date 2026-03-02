
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faRoad, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '../../Config/maps';
import poolService from '../../Services/poolService';

const DriverPublishOutstationRentalScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();

    // Route State
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [originCoords, setOriginCoords] = useState<number[] | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);

    // Pricing State
    const [pricePerKm, setPricePerKm] = useState('15');
    const [nightCharge, setNightCharge] = useState('250');

    // Toggle
    const [isNightStay, setIsNightStay] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faChevronLeft} size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Publish Rental</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                {/* Route Section */}
                <View style={[styles.card, { zIndex: 1000, elevation: 10, overflow: 'visible' }]}>
                    <Text style={styles.sectionTitle}>ROUTE</Text>
                    <View style={[styles.routeContainer, { zIndex: 1000, overflow: 'visible' }]}>
                        <View style={styles.timeline}>
                            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                            <View style={styles.line} />
                            <View style={[styles.dot, { backgroundColor: '#1E293B', borderRadius: 2 }]} />
                        </View>
                        <View style={[styles.routeInputs, { zIndex: 1000, overflow: 'visible' }]}>
                            <View style={[styles.inputWrapper, { zIndex: 2000, elevation: 20, overflow: 'visible' }]}>
                                <Text style={styles.inputLabel}>FROM</Text>
                                <GooglePlacesAutocomplete
                                    placeholder="Select Origin"
                                    fetchDetails={true}
                                    onPress={(data, details = null) => {
                                        setOrigin(data.description);
                                        if (details) {
                                            setOriginCoords([details.geometry.location.lng, details.geometry.location.lat]);
                                        }
                                    }}
                                    query={{ key: GOOGLE_MAPS_API_KEY, language: 'en' }}
                                    enablePoweredByContainer={false}
                                    minLength={2}
                                    debounce={400}
                                    keyboardShouldPersistTaps="handled"
                                    textInputProps={{
                                        placeholderTextColor: '#94A3B8',
                                    }}
                                    styles={{
                                        container: { flex: 0, overflow: 'visible' },
                                        textInput: styles.textInput,
                                        listView: { position: 'absolute', top: 58, left: 0, right: 0, zIndex: 9999, elevation: 99, backgroundColor: '#FFF', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } }
                                    }}
                                />
                            </View>
                            <View style={[styles.inputWrapper, { zIndex: 1000, elevation: 10, overflow: 'visible' }]}>
                                <Text style={styles.inputLabel}>TO</Text>
                                <GooglePlacesAutocomplete
                                    placeholder="Select Destination"
                                    fetchDetails={true}
                                    onPress={(data, details = null) => {
                                        setDestination(data.description);
                                        if (details) {
                                            setDestinationCoords([details.geometry.location.lng, details.geometry.location.lat]);
                                        }
                                    }}
                                    query={{ key: GOOGLE_MAPS_API_KEY, language: 'en' }}
                                    enablePoweredByContainer={false}
                                    minLength={2}
                                    debounce={400}
                                    keyboardShouldPersistTaps="handled"
                                    textInputProps={{
                                        placeholderTextColor: '#94A3B8',
                                    }}
                                    styles={{
                                        container: { flex: 0, overflow: 'visible' },
                                        textInput: styles.textInput,
                                        listView: { position: 'absolute', top: 58, left: 0, right: 0, zIndex: 9999, elevation: 99, backgroundColor: '#FFF', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } }
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pricing Section */}
                <View style={styles.card}>
                    <View style={styles.pricingHeader}>
                        <Text style={styles.sectionTitle}>PRICING</Text>
                    </View>

                    {/* Per KM */}
                    <View style={styles.priceRow}>
                        <View style={styles.priceIcon}>
                            <FontAwesomeIcon icon={faRoad} size={20} color="#111827" />
                        </View>
                        <View style={styles.priceInfo}>
                            <Text style={styles.priceTitle}>Price per Km</Text>
                            <Text style={styles.priceDesc}>Base charge for distance</Text>
                        </View>
                        <View style={styles.priceInputContainer}>
                            <Text style={styles.currency}>₹</Text>
                            <TextInput
                                style={styles.priceInput}
                                value={pricePerKm}
                                onChangeText={setPricePerKm}
                                keyboardType="numeric"
                            />
                            <Text style={styles.perUnit}>/km</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Night Charge */}
                    <View style={styles.priceRow}>
                        <View style={styles.priceIcon}>
                            <FontAwesomeIcon icon={faMoon} size={20} color="#6366F1" />
                        </View>
                        <View style={styles.priceInfo}>
                            <Text style={styles.priceTitle}>Night Charge</Text>
                            <Text style={styles.priceDesc}>Applicable for overnight stays</Text>
                        </View>
                        <View style={styles.priceInputContainer}>
                            <Text style={styles.currency}>₹</Text>
                            <TextInput
                                style={styles.priceInput}
                                value={nightCharge}
                                onChangeText={setNightCharge}
                                keyboardType="numeric"
                            />
                            <Text style={styles.perUnit}>/night</Text>
                        </View>
                    </View>
                </View>

                {/* Options */}
                <View style={styles.toggleCard}>
                    <View style={styles.toggleInfo}>
                        <Text style={styles.toggleTitle}>Allow Night Stays?</Text>
                        <Text style={styles.toggleDesc}>Drivers may need accommodation</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#E5E7EB", true: "#F59E0B" }}
                        thumbColor={"#FFFFFF"}
                        onValueChange={setIsNightStay}
                        value={isNightStay}
                    />
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.publishButton,
                        (origin && destination && pricePerKm)
                            ? { backgroundColor: '#0F172A' }
                            : { backgroundColor: '#CBD5E1' }
                    ]}
                    disabled={!(origin && destination && pricePerKm)}
                    onPress={async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');

                            const response = await poolService.publishRide({
                                type: 'rental',
                                originName: origin,
                                originCoords: originCoords,
                                destinationName: destination,
                                destinationCoords: destinationCoords,
                                scheduledTime: new Date().toISOString(), // Default to now so it's active
                                vehicle: user?.driverDetails?.vehicle?.model || "Outstation SUV",
                                totalSeats: 4, // Default full vehicle
                                pricePerSeat: Number(pricePerKm) || 15,
                                preferences: {
                                    nightStay: isNightStay,
                                    nightCharge: Number(nightCharge) || 250
                                }
                            });

                            if (response.success) {
                                navigation.navigate('DriverMyTrips' as never);
                            } else {
                                Alert.alert('Publish Failed', response.message);
                            }
                        } catch (error: any) {
                            console.error('Publish rental error:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to publish. Ensure you are logged in.');
                        }
                    }}
                >
                    <Text style={[
                        styles.publishButtonText,
                        (origin && destination && pricePerKm)
                            ? { color: '#FFFFFF' }
                            : { color: '#64748B' }
                    ]}>Publish Rental</Text>
                </TouchableOpacity>
            </View>

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
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    // Route Styles
    routeContainer: {
        flexDirection: 'row',
    },
    timeline: {
        alignItems: 'center',
        marginRight: 16,
        marginTop: 30,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    line: {
        width: 2,
        height: 40,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
        borderStyle: 'dashed',
    },
    routeInputs: {
        flex: 1,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    // Pricing Styles
    pricingHeader: {
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceIcon: {
        width: 40,
        alignItems: 'center',
    },
    priceInfo: {
        flex: 1,
    },
    priceTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    priceDesc: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    priceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    currency: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
        marginRight: 4,
    },
    priceInput: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        minWidth: 40,
        textAlign: 'right',
        padding: 0,
    },
    perUnit: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    // Toggle Styles
    toggleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleInfo: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    toggleDesc: {
        fontSize: 12,
        color: '#6B7280',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    publishButton: {
        backgroundColor: '#CBD5E1',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#64748B',
    }
});

export default DriverPublishOutstationRentalScreen;
