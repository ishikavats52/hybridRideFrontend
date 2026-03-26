import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faBell,
    faGlobe,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavBar from '../Navigation/BottomNavBar';
import DriverBottomNavBar from '../Navigation/DriverBottomNavBar';
import { useAuth } from '../Context/AuthContext';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const toggleSwitch = () => setNotificationsEnabled(previousState => !previousState);

    const { mode } = (route.params as { mode?: string }) || {};

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <FontAwesomeIcon icon={faArrowLeft} size={20} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Preferences */}
                    <Text style={styles.sectionTitle}>PREFERENCES</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={styles.iconCircle}>
                                <FontAwesomeIcon icon={faBell} size={18} color="#9333EA" />
                            </View>
                            <Text style={styles.rowText}>Notifications</Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#10B981' }}
                                thumbColor={'#FFFFFF'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={notificationsEnabled}
                            />
                        </View>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.row}>
                            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                                <FontAwesomeIcon icon={faGlobe} size={18} color="#2563EB" />
                            </View>
                            <Text style={styles.rowText}>Language</Text>
                            <View style={styles.valueContainer}>
                                <Text style={styles.valueText}>English (US)</Text>
                                <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" style={{ marginLeft: 8 }} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Support & Legal */}
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>SUPPORT & LEGAL</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.simpleRow}>
                            <Text style={styles.simpleRowText}>Help Center</Text>
                            <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" />
                        </TouchableOpacity>
                        <View style={styles.dividerFull} />
                        <TouchableOpacity style={styles.simpleRow}>
                            <Text style={styles.simpleRowText}>Privacy Policy</Text>
                            <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" />
                        </TouchableOpacity>
                        <View style={styles.dividerFull} />
                        <TouchableOpacity style={styles.simpleRow}>
                            <Text style={styles.simpleRowText}>Terms of Service</Text>
                            <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    {/* Log Out */}
                    {/* <TouchableOpacity style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity> */}

                    <Text style={styles.versionText}>Version 2.4.0 (Build 390)</Text>

                </ScrollView>
            </SafeAreaView>

            {mode === 'driver' || user?.role === 'driver' ? (
                <DriverBottomNavBar activeTab="PROFILE" />
            ) : (
                <BottomNavBar activeTab="PROFILE" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        marginBottom: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3E8FF', // Light purple
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rowText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 14,
        color: '#6B7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 60,
    },
    dividerFull: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 16,
    },
    simpleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    simpleRowText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    logoutButton: {
        marginTop: 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA', // Light red border
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#DC2626', // Red
    },
    versionText: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default SettingsScreen;
