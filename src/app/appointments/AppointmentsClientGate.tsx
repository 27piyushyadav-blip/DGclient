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
        
        // Transform booking data to match the expected appointment structure
        const transformedAppointments = bookingsArray.map((item: any) => {
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
