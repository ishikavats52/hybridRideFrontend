import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCar, faWallet, faHeadset, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

type DriverBottomNavBarProps = {
    activeTab: 'RIDES' | 'PAYMENTS' | 'SUPPORT' | 'PROFILE';
};

const DriverBottomNavBar = ({ activeTab }: DriverBottomNavBarProps) => {
    const navigation = useNavigation();

    const handlePress = (tab: 'RIDES' | 'PAYMENTS' | 'SUPPORT' | 'PROFILE') => {
        if (tab === activeTab) return;

        switch (tab) {
            case 'RIDES':
                navigation.navigate('DriverHome' as never);
                break;
            case 'PAYMENTS':
                navigation.navigate('Wallet', { mode: 'driver' } as never);
                break;
            case 'SUPPORT':
                navigation.navigate('Support', { mode: 'driver' } as never);
                break;
            case 'PROFILE':
                navigation.navigate('DriverProfile' as never);
                break;
        }
    };

    return (
        <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => handlePress('RIDES')}>
                <FontAwesomeIcon
                    icon={faCar}
                    size={20}
                    color={activeTab === 'RIDES' ? "#111827" : "#9CA3AF"}
                />
                <Text style={[styles.navText, activeTab === 'RIDES' && styles.activeNavText]}>RIDES</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handlePress('PAYMENTS')}>
                <FontAwesomeIcon
                    icon={faWallet}
                    size={20}
                    color={activeTab === 'PAYMENTS' ? "#111827" : "#9CA3AF"}
                />
                <Text style={[styles.navText, activeTab === 'PAYMENTS' && styles.activeNavText]}>PAYMENTS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handlePress('SUPPORT')}>
                <FontAwesomeIcon
                    icon={faHeadset}
                    size={20}
                    color={activeTab === 'SUPPORT' ? "#111827" : "#9CA3AF"}
                />
                <Text style={[styles.navText, activeTab === 'SUPPORT' && styles.activeNavText]}>SUPPORT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => handlePress('PROFILE')}>
                <FontAwesomeIcon
                    icon={faUser}
                    size={20}
                    color={activeTab === 'PROFILE' ? "#111827" : "#9CA3AF"}
                />
                <Text style={[styles.navText, activeTab === 'PROFILE' && styles.activeNavText]}>PROFILE</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    activeNavText: {
        color: '#111827',
    },
});

export default DriverBottomNavBar;
