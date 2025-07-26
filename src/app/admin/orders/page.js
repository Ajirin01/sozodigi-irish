// app/admin/orders/page.js
import { Suspense } from 'react';
import OrdersPageContent from './OrdersPageContent';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
