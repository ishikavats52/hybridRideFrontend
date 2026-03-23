import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService } from '../../Services/authService';

GoogleSignin.configure({
    webClientId: '110831328035-bqft18nqtfk06o3qrc78d414s731m8b5.apps.googleusercontent.com',
});
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
    isAppLoading: boolean;
    login: (credentials: any) => Promise<any>;
    loginWithGoogle: (role: string) => Promise<void>;
    register: (userData: any) => Promise<any>;
    verifyOTP: (phone: string, otp: string) => Promise<void>;
    whatsappLogin: (phone: string) => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAppLoading, setIsAppLoading] = useState(true);

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
                setIsAppLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: any) => {
        setIsLoading(true);
        try {
            const data = await authService.login(credentials);
            if (data.data.token) {
                setUser(data.data);
            }
            return data;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const whatsappLogin = async (phone: string) => {
        setIsLoading(true);
        try {
            const response = await authService.whatsappLogin(phone);
            if (response.data?.otpRequired) {
                // Return or set some state if needed, but the Screen will handle navigation
            }
        } catch (error: any) {
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async (phone: string, otp: string) => {
        setIsLoading(true);
        try {
            const data = await authService.verifyOTP(phone, otp);
            if (data.data.token) {
                setUser(data.data);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (role: string = 'passenger') => {
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            // Force account picker by signing out first if previously signed in
            if (GoogleSignin.hasPreviousSignIn()) {
                await GoogleSignin.signOut();
            }
            const userInfo = await GoogleSignin.signIn();

            console.log('Google Sign-In raw response:', JSON.stringify(userInfo));

            if (userInfo.type === 'cancelled') {
                console.log('Google Sign-In was cancelled');
                return;
            }

            if (userInfo.type !== 'success' || !userInfo.data) {
                throw new Error('Google Sign-In failed or cancelled');
            }

            const idToken = userInfo.data.idToken;

            if (!idToken) throw new Error('No ID token found in Google response. Check your webClientId configuration or SHA-1 hashes.');

            const data = await authService.loginWithGoogle(idToken, role);
            setUser(data.data);
            return data;
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            // Re-throw so the component can handle specific codes like 404
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        try {
            const data = await authService.register(userData);
            // Don't set user here, force manual login or app-controlled login
            return data;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();

            // Try to sign out of Google if the user was signed in with Google
            const isSignedIn = GoogleSignin.hasPreviousSignIn();
            if (isSignedIn) {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsLoading(false);
        }
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
        <AuthContext.Provider value={{ user, isLoading, isAppLoading, login, loginWithGoogle, whatsappLogin, register, verifyOTP, logout, refetchUser }}>
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
