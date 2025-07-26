// app/admin/medical-tourism/consultations/appointments/page.jsx
import { Suspense } from "react";
import BookingReviewContent from "./BookingReviewContent";

const BookingReviewPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingReviewContent />
    </Suspense>
  );
};

export default BookingReviewPage;
