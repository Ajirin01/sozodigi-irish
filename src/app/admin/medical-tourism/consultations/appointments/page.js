// app/admin/medical-tourism/consultations/appointments/page.jsx
import { Suspense } from "react";
import ConsultationAppointmentsPageContent from "./ConsultationAppointmentsPageContent";

const ConsultationAppointmentsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationAppointmentsPageContent />
    </Suspense>
  );
};

export default ConsultationAppointmentsPage;
