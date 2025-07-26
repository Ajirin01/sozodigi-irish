import { Suspense } from 'react';
import VerifyOtpPage from './VerifyOtpPage'; // move your logic into this component

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}
