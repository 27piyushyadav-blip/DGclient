import { apiClient } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createBookingApi(bookingData: {
  expertId: string;
  organizationId?: string;
  service: string;
  consultationType: string;
  scheduledDate: string;
  duration: number;
  amount: number;
  notes?: string;
  pointsToRedeem?: number;
}) {
  return apiClient<any>(`${BASE_URL}/bookings`, {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export async function getClientBookingsApi(status?: string) {
  const queryParams = status ? `?status=${status}` : '';
  return apiClient<any>(`${BASE_URL}/bookings/my${queryParams}`, {
    method: 'GET',
  });
}

export async function getBookingDetailsApi(bookingId: string) {
  return apiClient<any>(`${BASE_URL}/bookings/${bookingId}`, {
    method: 'GET',
  });
}

export async function cancelBookingApi(bookingId: string, reason?: string) {
  return apiClient<any>(`${BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ─── Refund Request API ───────────────────────────────────────────────────────

export async function createRefundRequestApi(refundData: {
  bookingId: string;
  amount: string;
  reason: string;
  refundType: string;
  paymentMethod?: string;
  metadata?: any;
}) {
  return apiClient<any>(`${BASE_URL}/organizations/refunds`, {
    method: 'POST',
    body: JSON.stringify(refundData),
  });
}

// ─── Edit Service Request API ─────────────────────────────────────────────────

export async function createEditServiceRequestApi(editData: {
  bookingId: string;
  originalService: string;
  originalAmount: string;
  newService: string;
  newAmount: string;
  reason: string;
  metadata?: any;
}) {
  return apiClient<any>(`${BASE_URL}/organizations/edit-service-requests`, {
    method: 'POST',
    body: JSON.stringify(editData),
  });
}

export async function getPublicBookingDetailsApi(bookingId: string) {
  return apiClient<any>(`${BASE_URL}/bookings/public/${bookingId}`, {
    method: 'GET',
    skipAuth: true,
  });
}

export async function payPublicBookingApi(bookingId: string, paymentIntentId?: string) {
  return apiClient<any>(`${BASE_URL}/bookings/public/${bookingId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId }),
    skipAuth: true,
  });
}

export async function getPublicBookingPaymentIntentApi(bookingId: string, pointsToRedeem?: number) {
  return apiClient<any>(`${BASE_URL}/bookings/public/${bookingId}/payment-intent`, {
    method: 'POST',
    body: JSON.stringify({ pointsToRedeem }),
    skipAuth: true,
  });
}

export async function createPaymentIntentApi(paymentData: { amount: number; bookingId?: string }) {
  return apiClient<any>(`${BASE_URL}/payments/create`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
}


