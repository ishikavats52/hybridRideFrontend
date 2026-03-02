import apiClient from './apiClient';

export const driverService = {
    getProfile: async () => {
        const response = await apiClient.get('/driver/profile');
        return response.data;
    },

    toggleStatus: async () => {
        const response = await apiClient.post('/driver/status');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await apiClient.put('/driver/profile', data);
        return response.data;
    },

    uploadDocument: async (formData: FormData) => {
        const response = await apiClient.post('/driver/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};