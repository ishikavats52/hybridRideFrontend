import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android Emulator: 10.0.2.2
// Physical Device: Your Machine IP (e.g., 192.168.1.x)
const BASE_URL = 'http://10.0.2.2:5000/api';
// const BASE_URL = 'https://hybridride.onrender.com/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 (Auth Error)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('userToken');
            // Navigate to login? (Handled by AuthContext state usually)
        }
        return Promise.reject(error);
    }
);

export const getImageUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const normalizedPath = path.replace(/\\/g, '/');
    const root = BASE_URL.replace('/api', '');
    return `${root}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
};

export { BASE_URL };
export default apiClient;
