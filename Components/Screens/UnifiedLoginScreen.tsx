
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../Context/AuthContext';

const { width, height } = Dimensions.get('window');

const UnifiedLoginScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { login, loginWithGoogle, whatsappLogin, isLoading } = useAuth();
    
    const { userType = 'PASSENGER' } = route.params || {};
    const isDriver = userType === 'DRIVER';

    const [phoneNumber, setPhoneNumber] = useState('');
    const [isWhatsAppMode, setIsWhatsAppMode] = useState(false);

    const handleBack = React.useCallback(() => {
        (navigation as any).navigate('Entry');
        return true;
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => handleBack();
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [handleBack])
    );

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
            return;
        }

        try {
            if (isWhatsAppMode) {
                await whatsappLogin(phoneNumber);
            } else {
                // If standard phone login, use whatsappLogin as placeholder or direct login
                await whatsappLogin(phoneNumber); 
            }
            
            (navigation as any).navigate('OtpVerification', { 
                phoneNumber, 
                userType,
                isLogin: true 
            });
        } catch (error: any) {
            console.error(error);
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle(userType.toLowerCase());
        } catch (error: any) {
            console.error('Google login error:', error);
            if (error.response?.status === 404 && error.response?.data?.isRegistered === false) {
                console.log("New user detected, navigating to ProfileSetup with phoneNumber:", phoneNumber);
                (navigation as any).navigate('ProfileSetup', {
                    userType,
                    phoneNumber,
                    googleData: error.response.data.googleData
                });
            } else {
                Alert.alert('Google Login Failed', 'Could not sign in with Google.');
            }
        }
    };

    const handleAppleLogin = () => {
        Alert.alert('Apple Sign-In', 'Apple authentication will be available in the production build.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{isDriver ? 'DRIVER ACCOUNT' : 'PASSENGER ACCOUNT'}</Text>
                        </View>
                        <TouchableOpacity style={styles.languageSelector}>
                            <Text style={styles.languageText}>English</Text>
                            <FontAwesomeIcon icon={faChevronDown} size={10} color="#FFFFFF" style={{ marginLeft: 5 }} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content Card */}
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.cardContainer}
                >
                    <View style={styles.card}>
                        <Text style={styles.brandTitle}>Sanchari</Text>
                        <Text style={styles.tagline}>Moving together, every journey.</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder={isWhatsAppMode ? "WhatsApp Number" : "Phone Number"}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                maxLength={10}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.sendOtpButton} 
                            onPress={handleSendOTP}
                            disabled={isLoading}
                        >
                            <Text style={styles.sendOtpText}>
                                {isLoading ? 'Sending...' : isWhatsAppMode ? 'Send WhatsApp OTP' : 'Send OTP'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.signInButton}
                            onPress={handleSendOTP} // Assuming sign in also triggers flow if number not verified
                            disabled={isLoading}
                        >
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or sign in with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialContainer}>
                            <TouchableOpacity 
                                style={[styles.socialIconCircle, isWhatsAppMode && styles.activeSocialCircle]}
                                onPress={() => setIsWhatsAppMode(!isWhatsAppMode)}
                            >
                                <FontAwesomeIcon icon={faWhatsapp} size={28} color="#25D366" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIconCircle} onPress={handleGoogleLogin}>
                                <FontAwesomeIcon icon={faGoogle} size={24} color="#EA4335" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIconCircle} onPress={handleAppleLogin}>
                                <FontAwesomeIcon icon={faApple} size={26} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.signUpText}>
                            Don't have an account?{' '}
                            <Text 
                                style={styles.signUpLink}
                                onPress={() => (navigation as any).navigate('ProfileSetup', { userType, phoneNumber })}
                            >
                                Sign Up
                            </Text>
                        </Text>

                        <Text style={styles.termsText}>
                            By clicking continue, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms</Text> and <Text style={styles.termsLink}>Privacy</Text>
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#009B8D', // Custom Teal color from image
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 60,
    },
    backButton: {
        padding: 5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 15,
    },
    roleText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 5,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Trying to match the serif look
    },
    tagline: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 30,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 55,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    sendOtpButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#D1FAE5', // Light teal
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    sendOtpText: {
        color: '#059669', // Dark teal text
        fontSize: 16,
        fontWeight: '700',
    },
    signInButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#009B8D',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    signInText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        paddingHorizontal: 10,
        color: '#9CA3AF',
        fontSize: 12,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 30,
    },
    socialIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    activeSocialCircle: {
        borderColor: '#009B8D',
        borderWidth: 2,
        backgroundColor: '#F0FDFA',
    },
    signUpText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 25,
    },
    signUpLink: {
        color: '#009B8D',
        fontWeight: 'bold',
    },
    termsText: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 16,
    },
    termsLink: {
        color: '#111827',
        fontWeight: 'bold',
    },
});

export default UnifiedLoginScreen;
