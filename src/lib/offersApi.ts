/*
 * File: src/lib/offersApi.ts
 * SR-DEV: API service for offers functionality
 */

import { apiClient } from './apiClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface OfferItem {
  id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  discountSnapshot?: {
    type: 'percent' | 'fixed';
    value: number;
  };
  finalPriceSnapshot: number;
  quantity: number;
}

export interface OfferPayload {
  id: string;
  status: 'sent' | 'accepted' | 'paid' | 'expired' | 'cancelled';
  currency: string;
  items: OfferItem[];
  totals: {
    subtotal: number;
    discountAmount: number;
    total: number;
  };
  expiresAt?: string;
}

export interface AcceptOfferResponse {
  success: boolean;
  offer: OfferPayload;
}

export interface DeclineOfferResponse {
  success: boolean;
  offer: OfferPayload;
}

export interface PayOfferResponse {
  success: boolean;
  paymentUrl: string;
  offer: OfferPayload;
}

export const offersApi = {
  /**
   * Accept an offer
   */
  acceptOffer: async (offerId: string): Promise<AcceptOfferResponse> => {
    return apiClient<AcceptOfferResponse>(`${API_BASE}/offers/${offerId}/accept`, {
      method: 'POST'
    });
  },

  /**
   * Decline an offer
   */
  declineOffer: async (offerId: string): Promise<DeclineOfferResponse> => {
    return apiClient<DeclineOfferResponse>(`${API_BASE}/offers/${offerId}/decline`, {
      method: 'POST'
    });
  },

  /**
   * Initiate payment for an offer
   */
  payForOffer: async (offerId: string): Promise<PayOfferResponse> => {
    return apiClient<PayOfferResponse>(`${API_BASE}/offers/${offerId}/pay`, {
      method: 'POST'
    });
  },

  /**
   * Get offer details
   */
  getOffer: async (offerId: string): Promise<{ offer: OfferPayload }> => {
    return apiClient<{ offer: OfferPayload }>(`${API_BASE}/offers/${offerId}`);
  },

  /**
   * Get all offers for a conversation
   */
  getConversationOffers: async (conversationId: string): Promise<{ offers: OfferPayload[] }> => {
    return apiClient<{ offers: OfferPayload[] }>(`${API_BASE}/chat/${conversationId}/offers`);
  }
};
