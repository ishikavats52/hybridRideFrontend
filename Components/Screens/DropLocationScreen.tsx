import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '../../Config/maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faMapLocationDot,
    faHouse,
    faBriefcase,
    faClock,
    faLocationDot,
    faHeart
} from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');

const DropLocationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { pickupAddress, pickupCoords } = (route.params as any) || {};

    const [searchText, setSearchText] = useState('');

    const recentPlaces = [
        { id: 1, name: 'Union Square', address: 'San Francisco, CA', type: 'recent' },
        { id: 2, name: 'SFO Terminal 1', address: 'San Francisco, CA', type: 'recent' },
    ];

    const savedPlaces = [
        { id: 3, name: 'Chase Center', address: '1 Warriors Way, San Francisco', type: 'saved' },
        { id: 4, name: 'Golden Gate Bridge', address: 'San Francisco, CA', type: 'saved' },
        { id: 5, name: 'Pier 39', address: 'The Embarcadero San Francisco, CA', type: 'saved' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faArrowLeft} size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Drop Location</Text>
                <View style={{ width: 20 }} />
            </View>

            {/* Fixed Top Content */}
            <View style={[styles.fixedContent, { zIndex: 1000 }]}>
                {/* Search Input */}
                <GooglePlacesAutocomplete
                    placeholder="Where are you going?"
                    onPress={(data, details = null) => {
                        if (details) {
                            (navigation as any).navigate('RideSelection', {
                                pickupAddress: pickupAddress || 'Current Location',
                                pickupCoords: pickupCoords || null,
                                dropoffAddress: data.description,
                                dropoffCoords: [details.geometry.location.lng, details.geometry.location.lat]
                            });
                        }
                    }}
                    query={{
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'en',
                        components: 'country:in'
                    }}
                    fetchDetails={true}
                    onFail={(error) => console.error('Autocomplete Error:', error)}
                    keyboardShouldPersistTaps="handled"
                    listUnderlayColor="transparent"
                    styles={{
                        container: {
                            flex: 0,
                            marginBottom: 20,
                            zIndex: 2000,
                        },
                        textInputContainer: {
                            backgroundColor: '#F3F4F6',
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            flexDirection: 'row',
                            alignItems: 'center',
                        },
                        textInput: {
                            flex: 1,
                            fontSize: 16,
                            fontWeight: '500',
                            color: '#111827',
                            backgroundColor: 'transparent',
                            marginBottom: 0,
                            height: 40,
                        },
                        listView: {
                            position: 'absolute',
                            top: 55,
                            left: 0,
                            right: 0,
                            backgroundColor: '#FFF',
                            borderRadius: 12,
                            elevation: 1000,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            zIndex: 1000,
                        },
                        row: {
                            padding: 13,
                            minHeight: 44,
                            flexDirection: 'row',
                        },
                    }}
                    renderLeftButton={() => (
                        <View style={[styles.searchDot, { marginTop: 0, marginLeft: 8 }]} />
                    )}
                />

                {/* Set on Map */}
                <TouchableOpacity style={styles.mapOption} onPress={() => navigation.navigate('RideSelection' as never)}>
                    <View style={styles.mapIconContainer}>
                        <FontAwesomeIcon icon={faMapLocationDot} size={18} color="#059669" />
                    </View>
                    <Text style={styles.mapOptionText}>Set destination on map</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.scrollContent, { flex: 1 }]}>

                {/* Home & Work */}
                {/* <Text style={styles.sectionHeader}>HOME</Text>
                <TouchableOpacity style={styles.placeItem} onPress={() => navigation.navigate('RideSelection' as never)}>
                    <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                        <FontAwesomeIcon icon={faHouse} size={18} color="#059669" />
                    </View>
                    <View style={styles.placeDetails}>
                        <Text style={styles.placeName}>Home</Text>
                        <Text style={styles.placeAddress}>123 Maple Avenue, San Francisco</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionHeader}>WORK</Text>
                <TouchableOpacity style={styles.addItem}>
                    <Text style={styles.addText}>+ Set Work Address</Text>
                </TouchableOpacity> */}

                {/* Most Visited */}
                {/* <Text style={styles.sectionHeader}>MOST VISITED</Text>
                {recentPlaces.map((place) => (
                    <TouchableOpacity key={place.id} style={styles.placeItem} onPress={() => navigation.navigate('RideSelection' as never)}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                            <FontAwesomeIcon icon={faClock} size={18} color="#111827" />
                        </View>
                        <View style={styles.placeDetails}>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <Text style={styles.placeAddress}>{place.address}</Text>
                        </View>
                    </TouchableOpacity>
                ))} */}


                {/* Recent & Saved */}
                {/* <Text style={styles.sectionHeader}>RECENT & SAVED</Text>
                {savedPlaces.map((place) => (
                    <TouchableOpacity key={place.id} style={styles.placeItem} onPress={() => navigation.navigate('RideSelection' as never)}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                            {place.type === 'saved' ? (
                                <FontAwesomeIcon icon={place.name.includes('Chase') ? faLocationDot : faHeart} size={18} color={place.name.includes('Chase') ? "#111827" : "#DC2626"} />
                            ) : (
                                <FontAwesomeIcon icon={faClock} size={18} color="#9CA3AF" />
                            )}
                        </View>
                        <View style={styles.placeDetails}>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <Text style={styles.placeAddress}>{place.address}</Text>
                        </View>
                    </TouchableOpacity>
                ))} */}

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    fixedContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#FFFFFF',
        overflow: 'visible',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        zIndex: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    searchDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#111827',
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    mapOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    mapIconContainer: {
        marginRight: 12,
    },
    mapOptionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669', // Teal
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '800',
        color: '#9CA3AF',
        marginBottom: 12,
        marginTop: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    placeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    placeDetails: {
        flex: 1,
    },
    placeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    placeAddress: {
        fontSize: 13,
        color: '#6B7280',
    },
    addItem: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        borderStyle: 'dashed',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    addText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9CA3AF',
    },
});

export default DropLocationScreen;
