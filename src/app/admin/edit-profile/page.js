import { Suspense } from 'react';
import SignUpPageContent from './SignUpPageContent';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}
