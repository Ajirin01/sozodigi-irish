'use client';

import { Suspense } from 'react';
import SignUpForm from './SignUpForm'; // or whatever your form component is

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
