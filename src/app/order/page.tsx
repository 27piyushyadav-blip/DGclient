// components/SubHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { Phone, RefreshCw, CreditCard, X, Calendar } from 'lucide-react';
import ExchangeService from './component/ExchangeService';
import RefundPayment from './component/RefundPayment';
import { getClientBookingsApi } from '@/lib/bookingsApi';
import { getOrganizationProfileByIdApi } from '@/lib/directoryApi';

const SubHeader: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'exchange' | 'refund' | null>("refund");
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableExperts, setAvailableExperts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrgServices() {
      if (!selectedBooking?.organizationId) return;
      try {
        const orgRes = await getOrganizationProfileByIdApi(selectedBooking.organizationId);
        if (orgRes && orgRes.status === 'success' && orgRes.data) {
          const orgData = orgRes.data;
          
          // Map organization services
          const mappedServices = (orgData.services || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            duration: `${s.durationMinutes || 60} min`,
            price: Number(s.basePrice) || 0,
            category: s.category || 'Service',
            image: s.imageUrl || '',
          }));
          
          // Map organization experts
          const mappedExperts = (orgData.experts || []).map((e: any) => ({
            id: e._id || e.id,
            name: e.name,
            role: e.specialization || "Wellness Professional",
            experience: `${e.experienceYears || 3} years`,
            rating: e.rating || 4.8,
            reviewCount: e.reviewCount || 120,
            image: e.profilePicture || "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop",
            specialties: e.specialties || [],
            services: e.services || [],
            available: true,
          }));

          setAvailableServices(mappedServices);
          setAvailableExperts(mappedExperts);
        }
      } catch (error) {
        console.error('Failed to fetch organization services/experts:', error);
      }
    }

    fetchOrgServices();
  }, [selectedBooking]);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await getClientBookingsApi();
        console.log('Bookings response:', response);

        // Handle the response structure - it might be nested with booking and expert
        const bookingsArray = Array.isArray(response) ? response : (response.bookings || []);

        // Group by booking ID to deduplicate left-joined rows
        const bookingsMap = new Map<string, any>();
        
        bookingsArray.forEach((item: any) => {
          const booking = item.booking || item;
          const bookingId = booking.id;
          if (!bookingId) return;

          const existingItem = bookingsMap.get(bookingId);
          if (!existingItem) {
            bookingsMap.set(bookingId, { ...item });
          } else {
            // Prioritize items with pending edit requests, or take the latest requestedAt date
            if (item.editRequest) {
              const existingEdit = existingItem.editRequest;
              if (!existingEdit || item.editRequest.status === 'pending' || new Date(item.editRequest.requestedAt || item.editRequest.createdAt || 0) > new Date(existingEdit.requestedAt || existingEdit.createdAt || 0)) {
                existingItem.editRequest = item.editRequest;
              }
            }
            // Prioritize items with pending refund requests, or take the latest requestedAt date
            if (item.refundRequest) {
              const existingRefund = existingItem.refundRequest;
              if (!existingRefund || item.refundRequest.status === 'pending' || new Date(item.refundRequest.requestedAt || item.refundRequest.createdAt || 0) > new Date(existingRefund.requestedAt || existingRefund.createdAt || 0)) {
                existingItem.refundRequest = item.refundRequest;
              }
            }
          }
        });

        const deduplicatedBookings = Array.from(bookingsMap.values());

        // Transform booking data to match the expected structure
        const transformedBookings = deduplicatedBookings.map((item: any) => {
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
            organizationId: booking.organizationId || organization?.id || organization?._id || '',
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id} className="text-slate-900 bg-white">
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
                  availableServices={availableServices}
                  availableExperts={availableExperts}
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
