// components/SubHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { Phone, RefreshCw, CreditCard, X, Calendar } from 'lucide-react';
import ExchangeService from './component/ExchangeService';
import RefundPayment from './component/RefundPayment';
import { getClientBookingsApi } from '@/lib/bookingsApi';

interface SubHeaderProps {
  initialActiveSection?: 'exchange' | 'refund' | null;
}

const SubHeader: React.FC<SubHeaderProps> = ({ initialActiveSection = "refund" }) => {
  const [activeSection, setActiveSection] = useState<'exchange' | 'refund' | null>(initialActiveSection);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await getClientBookingsApi();
        console.log('Bookings response:', response);

        // Handle the response structure - it might be nested with booking and expert
        const bookingsArray = Array.isArray(response) ? response : (response.bookings || []);

        // Transform booking data to match the expected structure
        const transformedBookings = bookingsArray.map((item: any) => {
          // Handle both nested structure (booking + expert + organization) and flat structure
          const booking = item.booking || item;
          const expert = item.expert || booking.expert;
          const organization = item.organization || booking.organization;

          return {
            id: booking.id,
            service: booking.service,
            amount: booking.amount,
            duration: booking.duration || 60,
            scheduledDate: booking.scheduledDate,
            status: booking.status,
            consultationType: booking.consultationType,
            meetingId: booking.meetingId,
            expertId: expert?.id || booking.expertId,
            organizationId: booking.organizationId,
            organizationName: organization?.name || booking.organizationName || '',
          };
        });

        setBookings(transformedBookings);
        if (transformedBookings.length > 0) {
          setSelectedBooking(transformedBookings[0]);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleSectionToggle = (section:  'exchange' | 'refund') => {
      setActiveSection(section);
  };

  const handleClose = () => {
    setActiveSection(null);
  };

  const transformBookingToService = (booking: any) => {
    return [{
      id: booking.id,
      name: booking.service,
      duration: `${booking.duration} min`,
      price: parseFloat(booking.amount),
      category: 'Service',
      image: '',
    }];
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex flex-col gap-2 p-4">

          {/* Booking Selection */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 mb-2 block">Select Booking</label>
            {isLoading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-sm text-gray-400">No bookings found</div>
            ) : (
              <select
                value={selectedBooking?.id || ''}
                onChange={(e) => setSelectedBooking(bookings.find(b => b.id === e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.service} - ${booking.amount}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Payment Refund Option Button */}
          <button
            onClick={() => handleSectionToggle('refund')}
            disabled={!selectedBooking}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === 'refund'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${!selectedBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CreditCard size={20} />
            <span className="font-medium">Refund Payment</span>
          </button>

          {/* Exchange Service Button */}
          <button
            onClick={() => handleSectionToggle('exchange')}
            disabled={!selectedBooking}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeSection === 'exchange'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${!selectedBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={20} />
            <span className="font-medium">Edit Services</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeSection && selectedBooking ? (
          <div className="p-3 animate-fadeIn">
            <div className="relative">
              {activeSection === 'exchange' && (
                <ExchangeService
                  bookingId={selectedBooking.id}
                  originalServices={transformBookingToService(selectedBooking)}
                  originalTotal={parseFloat(selectedBooking.amount)}
                />
              )}

              {activeSection === 'refund' && (
                <RefundPayment
                  bookingId={selectedBooking.id}
                  services={transformBookingToService(selectedBooking)}
                  totalPaid={parseFloat(selectedBooking.amount)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a booking to continue</p>
            </div>
          </div>
        )}
      </div>
    </div>

    </div>
  );
};

export default SubHeader;
