'use client';

import { Suspense } from 'react';
import AdminPharmaciesPageContent from './AdminPharmaciesPageContent'; // your real page content

export default function AdminPharmaciesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPharmaciesPageContent />
    </Suspense>
  );
}
