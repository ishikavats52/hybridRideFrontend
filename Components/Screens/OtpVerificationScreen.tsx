import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faPen } from '@fortawesome/free-solid-svg-icons';

const OtpVerificationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { phoneNumber = '+1 7078813158', userType = 'PASSENGER' } = route.params as any || {};

    // 6 digit OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const otpString = otp.join('');
        if (otpString.length === 6) {
            // Mock verification
            // In real app, call verify API here
            navigation.navigate('ProfileSetup' as never, { userType } as never);
        } else {
            Alert.alert("Invalid OTP", "Please enter a 6-digit code.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <FontAwesomeIcon icon={faArrowLeft} size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Enter code</Text>
                <View style={styles.subtitleContainer}>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit verification code to <Text style={styles.boldText}>{phoneNumber}</Text>
                    </Text>
                </View>

                <TouchableOpacity style={styles.editContainer} onPress={() => navigation.goBack()}>
                    <FontAwesomeIcon icon={faPen} size={12} color="#0F766E" />
                    <Text style={styles.editText}>Wrong details?</Text>
                </TouchableOpacity>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputs.current[index] = ref}
                            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.resendButton}>
                    <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>

            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
                    <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    content: {
        paddingHorizontal: 24,
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 10,
    },
    subtitleContainer: {
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#111827',
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    editText: {
        color: '#0F766E', // Teal
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    otpInputFilled: {
        borderColor: '#111827',
        borderWidth: 1.5,
    },
    resendButton: {
        alignItems: 'center',
    },
    resendText: {
        color: '#0F766E',
        fontWeight: '700',
        fontSize: 16,
    },
    footer: {
        padding: 24,
    },
    verifyButton: {
        backgroundColor: '#111827',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OtpVerificationScreen;
