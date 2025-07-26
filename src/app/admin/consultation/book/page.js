'use client';

import { Suspense } from 'react';
import ConsultationBookingPageContent from './BookingPageContent'; // or whatever your form component is

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationBookingPageContent />
    </Suspense>
  );
}
