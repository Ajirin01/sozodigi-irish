// app/admin/orders/page.js
import { Suspense } from 'react';
import CreateMedicalCertificate from './createContentPage';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateMedicalCertificate />
    </Suspense>
  );
}
