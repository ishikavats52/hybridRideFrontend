import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    register: async (userData: any) => {
        const response = await apiClient.post('/auth/register', userData);
        if (response.data.data.token) {
            await AsyncStorage.setItem('userToken', response.data.data.token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.data));
        }
        return response.data;
    },

    login: async (credentials: any) => {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.data.data.token) {
            await AsyncStorage.setItem('userToken', response.data.data.token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.data));
        }
        return response.data;
    },

    loginWithGoogle: async (idToken: string, role: string) => {
        const response = await apiClient.post('/auth/google', { idToken, role });
        if (response.data.data.token) {
            await AsyncStorage.setItem('userToken', response.data.data.token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.data));
        }
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
    }
};
