import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    Easing,
    Dimensions
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
    const progressAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnimation, {
            toValue: 1,
            duration: 7000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false, // width animation doesn't support native driver
        }).start();
    }, []);

    const progressWidth = progressAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.centerContent}>
                {/* Glowing Logo Circle */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoGlow} />
                    <View style={styles.iconBox}>
                        <View style={styles.iconCircle}>
                            <View style={styles.iconDashLeft} />
                            <FontAwesomeIcon icon={faLocationDot} size={40} color="#2DD4BF" />
                            <View style={styles.iconDashRight} />
                        </View>
                    </View>
                </View>

                {/* Brand Text */}
                <View style={styles.brandContainer}>
                    <Text style={styles.brandWhite}>Hybrid</Text>
                    <Text style={styles.brandCyan}>Ride</Text>
                </View>

                {/* Tagline */}
                <View style={styles.taglineRow}>
                    <View style={styles.taglineLine} />
                    <Text style={styles.taglineText}>P R E M I U M   M O B I L I T Y</Text>
                    <View style={styles.taglineLine} />
                </View>

                {/* Loading Bar */}
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingTrack}>
                        <Animated.View style={[styles.loadingFill, { width: progressWidth }]} />
                    </View>
                </View>
            </View>

            {/* Footer Text */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>A R G O S M O B   E C O S Y S T E M</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0F19', // Deep dark blue from the screenshot
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginTop: 60, // visual adjust to push it slightly up
    },
    logoContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logoGlow: {
        position: 'absolute',
        width: 140,
        height: 140,
        backgroundColor: '#2DD4BF',
        borderRadius: 70,
        opacity: 0.15, // Subtle cyan glow behind the box
        transform: [{ scale: 1.3 }],
    },
    iconBox: {
        width: 130,
        height: 130,
        backgroundColor: '#111827', // Darker inner box
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.2)', // Very faint cyan border
        shadowColor: '#2DD4BF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#2DD4BF',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    iconDashLeft: {
        width: 10,
        height: 4,
        backgroundColor: '#2DD4BF',
        marginRight: 4,
    },
    iconDashRight: {
        width: 10,
        height: 4,
        backgroundColor: '#2DD4BF',
        marginLeft: 4,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    brandWhite: {
        fontSize: 44,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    brandCyan: {
        fontSize: 44,
        fontWeight: '900',
        color: '#2DD4BF',
        letterSpacing: -1,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 60,
    },
    taglineText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        marginHorizontal: 12,
        letterSpacing: 2,
    },
    taglineLine: {
        width: 30,
        height: 1,
        backgroundColor: '#334155',
    },
    loadingContainer: {
        width: width * 0.5,
        marginTop: 20,
    },
    loadingTrack: {
        height: 2,
        backgroundColor: '#1E293B',
        borderRadius: 1,
        overflow: 'hidden',
    },
    loadingFill: {
        height: '100%',
        backgroundColor: '#2DD4BF',
        borderRadius: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    footerText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#334155',
        letterSpacing: 3,
    }
});

export default SplashScreen;
