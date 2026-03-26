import axios from 'axios';
import { CONFIG } from '../Constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getMyWalletData = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/wallet/my-wallet`, headers);
        return response.data;
    } catch (error: any) {
        return error.response?.data || { success: false, message: 'Network error' };
    }
};

export const requestWithdrawal = async (amount: number, method: 'instant' | 'bank', bankDetails?: any) => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${CONFIG.API_BASE_URL}/api/wallet/withdraw`, {
            amount,
            method,
            bankDetails
        }, headers);
        return response.data;
    } catch (error: any) {
        return error.response?.data || { success: false, message: 'Network error' };
    }
};

export default {
    getMyWalletData,
    requestWithdrawal
};
