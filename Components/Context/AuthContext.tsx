import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../Services/authService';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'passenger' | 'driver' | 'admin';
    driverApprovalStatus?: 'pending' | 'approved' | 'rejected';
    token?: string;
    profileImage?: string;
    walletBalance?: number;
    driverDetails?: {
        licenseNumber?: string;
        vehicle?: {
            make?: string;
            model?: string;
            plateNumber?: string;
        };
        ratings?: {
            average: number;
            count: number;
        };
        earnings?: number;
        isOnline?: boolean;
    };
    verificationStatus?: {
        email: boolean;
        phone: boolean;
        idCard: boolean;
        communityTrusted: boolean;
    };
    ridePersonality?: string[];
    savedPlaces?: {
        type: 'Home' | 'Work' | 'Other';
        label: string;
        address: string;
        coordinates?: number[];
    }[];
    travelStats?: {
        totalSavings: number;
        co2Saved: number;
    };
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for logged-in user on app launch
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userInfo');
                const token = await AsyncStorage.getItem('userToken');

                if (storedUser && token) {
                    // 1. Optimistically set user from storage
                    setUser({ ...JSON.parse(storedUser), token });

                    // 2. Verify token with backend
                    try {
                        const response = await authService.getMe();
                        if (response.success && response.data) {
                            // Update with fresh data from server
                            const freshUser = { ...response.data, token };
                            setUser(freshUser);
                            await AsyncStorage.setItem('userInfo', JSON.stringify(freshUser));
                        }
                    } catch (apiError) {
                        console.error('Token validation failed:', apiError);
                        // If 401, logout
                        await logout();
                    }
                }
            } catch (e) {
                console.error('Failed to load user', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: any) => {
        setIsLoading(true);
        try {
            const data = await authService.login(credentials);
            setUser(data.data);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        try {
            const data = await authService.register(userData);
            setUser(data.data);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await authService.logout();
        setUser(null);
        setIsLoading(false);
    };

    const refetchUser = async () => {
        try {
            const response = await authService.getMe();
            if (response.success && response.data) {
                const token = await AsyncStorage.getItem('userToken');
                setUser({ ...response.data, token });
                await AsyncStorage.setItem('userInfo', JSON.stringify({ ...response.data, token }));
            }
        } catch (error) {
            console.error('Failed to refetch user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, refetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
