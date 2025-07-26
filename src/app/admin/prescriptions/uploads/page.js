// app/admin/medical-tourism/consultations/appointments/page.jsx
import { Suspense } from "react";
import UploadedPrescriptionContent from "./UploadedPrescriptionContent";

const UploadedPrescriptionPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadedPrescriptionContent />
    </Suspense>
  );
};

export default UploadedPrescriptionPage;
