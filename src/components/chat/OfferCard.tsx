/*
 * File: src/components/chat/OfferCard.tsx
 * SR-DEV: Offer card component for displaying service offers in chat
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Tag, 
  Calendar, 
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";

type OfferItem = {
  id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  discountSnapshot?: {
    type: 'percent' | 'fixed';
    value: number;
  };
  finalPriceSnapshot: number;
  quantity: number;
  durationMinutes?: number;
};

type OfferPayload = {
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
};

interface OfferCardProps {
  payload: OfferPayload;
  isOwn: boolean;
  onAccept?: (offerId: string) => void;
  onDecline?: (offerId: string) => void;
  onPay?: (offerId: string) => void;
  isLoading?: boolean;
}

export default function OfferCard({ 
  payload: rawPayload, 
  isOwn, 
  onAccept, 
  onDecline, 
  onPay,
  isLoading = false
}: OfferCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize payload to handle old/missing data
  const payload = {
    ...rawPayload,
    id: rawPayload.id || (rawPayload as any).offerId,
    totals: rawPayload.totals || {
        subtotal: (rawPayload as any).subtotal || 0,
        discountAmount: (rawPayload as any).discountTotal || 0,
        total: (rawPayload as any).total || 0
    },
    items: (rawPayload.items || []).map((it: any) => ({
        ...it,
        priceSnapshot: it.priceSnapshot || it.basePriceSnapshot || 0,
        finalPriceSnapshot: it.finalPriceSnapshot || it.priceSnapshot || it.basePriceSnapshot || 0,
        durationMinutes: it.durationMinutes || 0
    }))
  };
  
  const formatPrice = (price: number, currency: string) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="w-3 h-3" />;
      case 'accepted': return <CheckCircle2 className="w-3 h-3" />;
      case 'paid': return <CheckCircle2 className="w-3 h-3" />;
      case 'expired': return <XCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const isExpired = payload.expiresAt && new Date(payload.expiresAt) < new Date();
  const canAct = payload.status === 'sent' && !isExpired && !isOwn;

  return (
    <div className={cn(
      "rounded-xl border-2 shadow-sm overflow-hidden",
      isOwn ? "bg-blue-50 border-blue-200" : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-zinc-500" />
            <span className="font-semibold text-zinc-900 dark:text-white">Service Offer</span>
            <Badge className={cn("text-xs", getStatusColor(payload.status))}>
              <div className="flex items-center gap-1">
                {getStatusIcon(payload.status)}
                <span className="capitalize">{payload.status}</span>
              </div>
            </Badge>
          </div>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
        </div>
        
        {payload.expiresAt && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            Expires: {new Date(payload.expiresAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-4">
        <div className="space-y-3">
          {payload.items.map((item, index) => (
            <div key={item.id || index} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
              <div className="flex-1">
                <h4 className="font-medium text-zinc-900 dark:text-white text-sm">
                  {item.nameSnapshot}
                </h4>
                {(item.quantity > 1 || item.durationMinutes > 0) && (
                  <span className="text-xs text-zinc-500">
                    {item.quantity > 1 && `Qty: ${item.quantity}`}
                    {item.quantity > 1 && item.durationMinutes > 0 && ` • `}
                    {item.durationMinutes > 0 && `${item.durationMinutes}m`}
                  </span>
                )}
              </div>
              <div className="text-right">
                {item.discountSnapshot && (
                  <div className="text-xs text-zinc-500 line-through">
                    {formatPrice(item.priceSnapshot, payload.currency)}
                  </div>
                )}
                <div className="font-semibold text-zinc-900 dark:text-white">
                  {formatPrice(item.finalPriceSnapshot, payload.currency)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="space-y-1">
            {payload.totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span>Discount</span>
                <span>-{formatPrice(payload.totals.discountAmount, payload.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold text-lg">
              <span className="text-zinc-900 dark:text-white">Total</span>
              <span className="text-zinc-900 dark:text-white">
                {formatPrice(payload.totals.total, payload.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canAct && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => onAccept?.(payload.id)}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Accept Offer
            </Button>
            <Button
              onClick={() => onDecline?.(payload.id)}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {/* Pay Button (for accepted offers) */}
        {payload.status === 'accepted' && !isOwn && (
          <Button
            onClick={() => onPay?.(payload.id)}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Proceed to Payment
          </Button>
        )}
      </div>
    </div>
  );
}
