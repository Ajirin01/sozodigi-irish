'use client';

import { Suspense } from 'react';
import LaboratoryPageContent from './LaboratoryPage'; // your page content component

export default function LaboratoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LaboratoryPageContent />
    </Suspense>
  );
}
