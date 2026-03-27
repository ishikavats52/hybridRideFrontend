import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faUniversity } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../Context/AuthContext';
import { driverService } from '../../Services/driverService';

const DriverBankDetailsScreen = () => {
    const navigation = useNavigation();
    const { user, refetchUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [accountHolderName, setAccountHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');

    useEffect(() => {
        if (user?.driverDetails?.bankDetails) {
            const { bankDetails } = user.driverDetails;
            setAccountHolderName(bankDetails.accountHolderName || '');
            setAccountNumber(bankDetails.accountNumber || '');
            setIfscCode(bankDetails.ifscCode || '');
            setBankName(bankDetails.bankName || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const updateData = {
                bankDetails: {
                    accountHolderName,
                    accountNumber,
                    ifscCode,
                    bankName
                }
            };

            await driverService.updateProfile(updateData);
            await refetchUser(); 
            Alert.alert('Success', 'Bank details updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Update failed:', error);
            Alert.alert('Error', 'Failed to update bank details');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faChevronLeft} size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bank Account Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {user?.driverDetails?.bankDetails?.accountNumber ? (
                        <View style={styles.savedCard}>
                            <Text style={styles.savedTitle}>LINKED ACCOUNT</Text>
                            <Text style={styles.savedValue}>{user.driverDetails.bankDetails.bankName}</Text>
                            <Text style={styles.savedSubText}>{user.driverDetails.bankDetails.accountHolderName}</Text>
                            <Text style={styles.savedSubText}>A/C: ****{user.driverDetails.bankDetails.accountNumber.slice(-4)}</Text>
                        </View>
                    ) : (
                        <View style={styles.infoBox}>
                            <FontAwesomeIcon icon={faUniversity} size={20} color="#059669" />
                            <Text style={styles.infoText}>
                                Please ensure your bank details are correct to avoid any payment delays or failures.
                            </Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>EDIT ACCOUNT INFORMATION</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Holder Name</Text>
                            <TextInput
                                style={styles.input}
                                value={accountHolderName}
                                onChangeText={setAccountHolderName}
                                placeholder="Enter full name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Number</Text>
                            <TextInput
                                style={styles.input}
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                placeholder="Enter account number"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>IFSC Code</Text>
                            <TextInput
                                style={styles.input}
                                value={ifscCode}
                                onChangeText={setIfscCode}
                                placeholder="e.g. SBIN0001234"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bank Name</Text>
                            <TextInput
                                style={styles.input}
                                value={bankName}
                                onChangeText={setBankName}
                                placeholder="e.g. State Bank of India"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Account Details</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#10B98133',
    },
    infoText: {
        fontSize: 13,
        color: '#065F46',
        marginLeft: 12,
        flex: 1,
        lineHeight: 18,
    },
    savedCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    savedTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#8B5CF6',
        letterSpacing: 2,
        marginBottom: 8,
    },
    savedValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    savedSubText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 8,
        marginTop: 8,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    saveButton: {
        backgroundColor: '#059669',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: '#6EE7B7',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    }
});

export default DriverBankDetailsScreen;
