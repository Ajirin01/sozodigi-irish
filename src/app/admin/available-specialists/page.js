import { Suspense } from "react";
import ConsultationSpecialistSelectPage from "./ConsultationSpecialistSelectPage";

export default function AvailableSpecialistsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationSpecialistSelectPage />
    </Suspense>
  );
}
