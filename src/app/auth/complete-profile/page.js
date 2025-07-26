// app/admin/medical-tourism/consultations/appointments/page.jsx
import { Suspense } from "react";
import CompleteProfileContentPage from "./CompleteProfileContentPage";

const CompleteProfilePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteProfileContentPage />
    </Suspense>
  );
};

export default CompleteProfilePage;
