// app/admin/medical-tourism/consultations/appointments/page.jsx
import { Suspense } from "react";
import LinkedPrescriptionContent from "./LinkedPrescriptionContent";

const LinkedPrescriptionPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LinkedPrescriptionContent />
    </Suspense>
  );
};

export default LinkedPrescriptionPage;
