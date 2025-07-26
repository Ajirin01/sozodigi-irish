// page.js
import { Suspense } from 'react';
import PaymentSuccessContentPage from './PaymentSuccessContentPage';

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContentPage />
    </Suspense>
  );
};

export default PaymentSuccessPage;
