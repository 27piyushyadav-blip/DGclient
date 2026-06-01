"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppointmentsClient from "./AppointmentsClient";
import { getClientBookingsApi } from "@/lib/bookingsApi";

export default function AppointmentsClientGate() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function fetchAppointments() {
      if (!isAuthenticated) return;
      
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

        // Transform booking data to match the expected appointment structure
        const transformedAppointments = deduplicatedBookings.map((item: any) => {
          // Handle both nested structure (booking + expert + organization) and flat structure
          const booking = item.booking || item;
          const expert = item.expert || booking.expert;
          const organization = item.organization || booking.organization;
          
          console.log('Booking item:', item);
          console.log('Organization:', organization);
          
          return {
            _id: booking.id,
            appointmentDate: booking.scheduledDate,
            appointmentTime: new Date(booking.scheduledDate).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            status: booking.status,
            serviceName: booking.service,
            price: booking.amount,
            appointmentType: booking.consultationType === 'online' ? 'Video Call' : 'In-Person',
            duration: booking.duration || 60,
            meetingId: booking.meetingId,
            expertId: {
              _id: expert?.id || booking.expertId,
              name: expert?.name || 'Expert',
              specialization: expert?.specialization || expert?.role || 'Specialist',
              profilePicture: expert?.avatar || expert?.image || '',
            },
            organizationName: organization?.name || booking.organizationName || '',
            organizationId: booking.organizationId,
            editRequest: item.editRequest || null,
            refundRequest: item.refundRequest || null,
          };
        });
        
        setAppointments(transformedAppointments);
      } catch (error: any) {
        console.error('Failed to fetch appointments:', error);
        // Show a toast notification for the error
        if (typeof window !== 'undefined' && (window as any).toast) {
          (window as any).toast.error('Failed to load appointments. Please try again.');
        }
        setAppointments([]); // Set empty array on error to prevent UI issues
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [isAuthenticated]);

  if (isLoading || loading) {
    return null;
  }

  return <AppointmentsClient allAppointments={appointments} />;
}
