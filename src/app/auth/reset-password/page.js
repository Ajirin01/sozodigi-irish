import { Suspense } from 'react';
import ResetPasswordContent from './resetPasswordContent'; // move your logic into this component

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
