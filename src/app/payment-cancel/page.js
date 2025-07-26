'use client';
import { useRouter } from 'next/navigation';

const PaymentCancel = () => {
  const router = useRouter();

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Canceled</h1>
      <p className="text-gray-700">Your payment has been canceled. If you have any issues, please try again or contact support.</p>
    </div>
  );
};

export default PaymentCancel;
