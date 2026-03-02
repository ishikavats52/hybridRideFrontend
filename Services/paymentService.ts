import apiClient from './apiClient';

export const createRazorpayOrder = async (amount: number) => {
    const response = await apiClient.post('/payments/create-order', { amount });
    return response.data;
};

export const verifyRazorpayPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    amount: number
) => {
    const response = await apiClient.post('/payments/verify', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount
    });
    return response.data;
};
