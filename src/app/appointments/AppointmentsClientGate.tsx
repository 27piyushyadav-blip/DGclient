"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemoAuth } from "@/components/DemoAuthProvider";
import AppointmentsClient from "./AppointmentsClient";

export default function AppointmentsClientGate() {
  const { session } = useDemoAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session?.user) {
    return null;
  }

  return <AppointmentsClient allAppointments={[]} />;
}
