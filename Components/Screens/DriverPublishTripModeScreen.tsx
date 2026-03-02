
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faBuilding, faMountain } from '@fortawesome/free-solid-svg-icons';

const DriverPublishTripModeScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faChevronLeft} size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CHOOSE MODE</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* City Pool Card */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('DriverPublishCityPool' as never)}
                >
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <FontAwesomeIcon icon={faBuilding} size={24} color="#000000" />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>City Pool</Text>
                        <Text style={styles.cardDescription}>
                            Intra-city pooled routes. Perfect for daily commutes or local trips.
                        </Text>
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>LOCAL MATCHING</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Outstation Pool Card */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('DriverPublishOutstationPool' as never)}
                >
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: '#6366F1' }]}>
                            <FontAwesomeIcon icon={faMountain} size={24} color="#FFFFFF" />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Outstation Pool</Text>
                        <Text style={styles.cardDescription}>
                            Long-distance routes between cities. Set your per-seat pricing.
                        </Text>
                        <View style={[styles.tagContainer, { borderColor: '#6366F1' }]}>
                            <Text style={[styles.tagText, { color: '#6366F1' }]}>INTER-CITY TRAVEL</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Outstation Rental Card */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('DriverPublishOutstationRental' as never)}
                >
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F59E0B' }]}>
                            <FontAwesomeIcon icon={faMountain} size={24} color="#FFFFFF" />
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Outstation Rental</Text>
                        <Text style={styles.cardDescription}>
                            Full vehicle rentals for outstation trips. Price per KM + night charges.
                        </Text>
                        <View style={[styles.tagContainer, { borderColor: '#F59E0B' }]}>
                            <Text style={[styles.tagText, { color: '#F59E0B' }]}>FULL TRIP • PER KM</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark Theme
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2DD4BF', // Teal
        letterSpacing: 1,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    iconContainer: {
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#2DD4BF', // Teal
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cardContent: {
        alignItems: 'flex-start',
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 20,
        marginBottom: 16,
    },
    tagContainer: {
        borderWidth: 1,
        borderColor: '#2DD4BF',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tagText: {
        color: '#2DD4BF',
        fontWeight: '800',
        fontSize: 10,
        letterSpacing: 1,
    }
});

export default DriverPublishTripModeScreen;
