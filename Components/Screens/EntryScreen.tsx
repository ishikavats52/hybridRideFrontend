
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationDot, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');

const EntryScreen = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('PASSENGER');

    const isDriver = userType === 'DRIVER';

    return (
        <SafeAreaView style={[styles.container, isDriver && styles.containerDriver]}>
            <StatusBar barStyle={isDriver ? "light-content" : "dark-content"} />

            {/* Background patterns */}
            <View style={styles.backgroundContainer}>
                {isDriver && (
                    <>
                        {/* Dot Pattern Simulation */}
                        <View style={styles.dotGrid} />
                    </>
                )}
            </View>

            {/* Top Toggle */}
            <View style={[styles.toggleContainer, isDriver && styles.toggleContainerDriver]}>
                <TouchableOpacity
                    style={[styles.toggleButton, !isDriver && styles.activeToggle]}
                    onPress={() => setUserType('PASSENGER')}
                >
                    <Text style={[styles.toggleText, !isDriver ? styles.activeToggleText : styles.inactiveToggleText]}>PASSENGER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, isDriver && styles.activeToggleDriver]}
                    onPress={() => setUserType('DRIVER')}
                >
                    <Text style={[styles.toggleText, isDriver ? styles.activeToggleTextDriver : styles.inactiveToggleTextDriver]}>DRIVER</Text>
                </TouchableOpacity>
            </View>

            {/* Floating Location Icon (Top Right Placeholder) */}
            <View style={styles.topLocationIconContainer}>
                <View style={[styles.locationIconCircle, isDriver && styles.locationIconCircleDriver]}>
                    <FontAwesomeIcon icon={faLocationDot} size={32} color={isDriver ? "#111827" : "#9CA3AF"} />
                    {isDriver && <View style={styles.driverIconOverlay} />}
                </View>
            </View>

            {/* Main Content Card */}
            <View style={[styles.cardContainer, isDriver && styles.cardContainerDriver]}>
                {/* Large Location Icon at top of card */}
                <View style={[styles.iconContainer, isDriver && styles.iconContainerDriver]}>
                    <View style={[styles.iconCircle, isDriver && styles.iconCircleDriver]}>
                        <FontAwesomeIcon icon={faLocationDot} size={32} color={isDriver ? "#111827" : "#111827"} />
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <View style={styles.logoContainer}>
                        <Text style={[styles.logoTextBold, isDriver && styles.textWhite]}>Hybrid</Text>
                        <Text style={[styles.logoTextLight, isDriver && styles.textTeal]}>Ride</Text>
                    </View>

                    <Text style={[styles.tagline, isDriver && styles.taglineDriver]}>
                        {isDriver ? 'Captain Dashboard' : 'Your City Partner'}
                    </Text>

                    <Text style={[styles.description, isDriver && styles.descriptionDriver]}>
                        {isDriver
                            ? 'Publish your outstation routes and\nstart earning with pooling.'
                            : 'Seamless city commutes and\noutstation travel in one app.'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.getStartedButton, isDriver && styles.getStartedButtonDriver]}
                    onPress={() => {
                        navigation.navigate('PassengerLogin', { userType: isDriver ? 'DRIVER' : 'PASSENGER' })
                    }}
                >
                    <Text style={[styles.buttonText, isDriver && styles.buttonTextDriver]}>
                        {isDriver ? 'Go to Dashboard' : 'Get Started'}
                    </Text>
                    <FontAwesomeIcon icon={faArrowRight} size={20} color={isDriver ? "#111827" : "#FFFFFF"} />
                </TouchableOpacity>

                <Text style={[styles.footerText, isDriver && styles.footerTextDriver]}>SECURED BY HYBRID ECOSYSTEM</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Light greyish blue background
    },
    containerDriver: {
        backgroundColor: '#1E293B', // Dark blue-gray like screenshot
        fontWeight: 'bold',  // Light greyish blue background
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    dotGrid: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundColor: 'transparent',
        // In React Native, creating a real dot grid pattern is hard without image/svg.
        // We leave it transparent or minor opacity for now.
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 4,
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignSelf: 'center',
        width: '80%',
        maxWidth: 300,
    },
    toggleContainerDriver: {
        backgroundColor: '#0F172A', // Very dark blue bg for toggle
        borderWidth: 1,
        borderColor: '#334155',
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeToggle: {
        backgroundColor: '#111827', // Dark blue/black
    },
    activeToggleDriver: {
        backgroundColor: '#2DD4BF', // Teal
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    activeToggleText: {
        color: '#FFFFFF',
    },
    activeToggleTextDriver: {
        color: '#111827', // Dark text on teal button
    },
    inactiveToggleText: {
        color: '#6B7280',
    },
    inactiveToggleTextDriver: {
        color: '#64748B', // Slate gray
    },
    topLocationIconContainer: {
        position: 'absolute',
        top: 150,
        right: 10,
    },
    locationIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 8,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationIconCircleDriver: {
        borderColor: '#2DD4BF', // Teal border
        backgroundColor: '#2DD4BF', // Transparent fill
        borderWidth: 6,
        width: 100, // Larger in screenshot
        height: 100,
        opacity: 0.8,
    },
    driverIconOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#2DD4BF',
        opacity: 0.1, // Tint inside
        borderRadius: 50,
    },
    cardContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    cardContainerDriver: {
        backgroundColor: '#0F172A', // Darker card matching bg roughly
        borderTopColor: '#1E293B',
        borderTopWidth: 0, // Seamless look in screenshot
    },
    iconContainer: {
        position: 'absolute',
        top: -50,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    iconContainerDriver: {
        backgroundColor: '#1E293B', // Dark squircle background
        padding: 20,
        borderRadius: 30, // Squircle shape
        top: -60,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    iconCircleDriver: {
        backgroundColor: 'transparent',
        borderColor: '#2DD4BF', // Teal border
        borderWidth: 3,
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    logoTextBold: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
    },
    logoTextLight: {
        fontSize: 28,
        fontWeight: '400',
        color: '#10B981',
    },
    textWhite: {
        color: '#FFFFFF',
    },
    textTeal: {
        color: '#2DD4BF', // Teal
        fontWeight: '900', // Bold in screenshot
    },
    tagline: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },
    taglineDriver: {
        color: '#2DD4BF', // Teal text
        fontSize: 18,
        fontWeight: '800', // Bold
        marginTop: 5,
    },
    description: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
        lineHeight: 20,
    },
    descriptionDriver: {
        color: '#94A3B8', // Slate 400
    },
    getStartedButton: {
        flexDirection: 'row',
        backgroundColor: '#111827',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    getStartedButtonDriver: {
        backgroundColor: '#2DD4BF', // Teal button
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        marginRight: 10,
    },
    buttonTextDriver: {
        color: '#111827', // Dark text
    },
    footerText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    footerTextDriver: {
        color: '#64748B', // Darker gray
    },
});

export default EntryScreen;
