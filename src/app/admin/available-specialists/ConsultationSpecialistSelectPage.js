"use client";

import OnlineSpecialistsList from "./OnlineSpecialistsList";
import { useSearchParams } from "next/navigation";

export default function ConsultationSpecialistSelectPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  return (
    <main className="p-6">
      <OnlineSpecialistsList appointmentId={appointmentId} />
    </main>
  );
}
