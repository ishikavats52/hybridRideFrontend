import apiClient from './apiClient';

export interface PoolRide {
    _id: string;
    type: 'local' | 'outstation' | 'intercity';
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    origin: {
        name: string;
        location: { type: 'Point'; coordinates: [number, number] };
    };
    destination: {
        name: string;
        location: { type: 'Point'; coordinates: [number, number] };
    };
    scheduledTime: string;
    vehicle?: string;
    totalSeats: number;
    availableSeats: number;
    pricePerSeat: number;
    seatPricing?: {
        front: number;
        middle: number;
        back: number;
    };
    host: {
        _id: string;
        name: string;
        phone: string;
        profileImage: string;
        driverDetails?: {
            ratings?: {
                average: number;
                count: number;
            };
            vehicle?: {
                make: string;
                model: string;
                plateNumber: string;
            };
        };
    };
    preferences?: {
        music: boolean;
        ac: boolean;
        quiet: boolean;
        pets: boolean;
    };
    route?: {
        distance?: number;
        duration?: number;
    };
}

export const poolService = {
    searchRides: async (type?: string, date?: string, fromCoords?: string, toCoords?: string) => {
        const params: any = {};
        if (type) params.type = type;
        if (date) params.date = date;
        if (fromCoords) params.fromCoords = fromCoords;
        if (toCoords) params.toCoords = toCoords;

        const response = await apiClient.get('/pools/search', { params });
        return response.data; // { success: boolean, data: PoolRide[] }
    },

    publishRide: async (payload: any) => {
        const response = await apiClient.post('/pools/publish', payload);
        return response.data; // { success: boolean, data: PoolRide }
    },

    bookSeat: async (rideId: string, seats: number = 1) => {
        const response = await apiClient.post(`/pools/${rideId}/book`, { seats });
        return response.data; // { success: boolean, data: PoolRide }
    },

    getPassengerHistory: async () => {
        const response = await apiClient.get('/pools/history');
        return response.data; // { success: boolean, data: PoolRide[] }
    },

    getDriverHistory: async () => {
        const response = await apiClient.get('/pools/driver-history');
        return response.data; // { success: boolean, data: PoolRide[] }
    },

    updateTripStatus: async (tripId: string, status: string) => {
        const response = await apiClient.put(`/pools/${tripId}/status`, { status });
        return response.data; // { success: boolean, data: PoolRide }
    }
};

export default poolService;
