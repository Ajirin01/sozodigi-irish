'use client';

import { Suspense } from 'react';
import LaboratoriesPageContent from './LaboratoriesPageContent'; // Assuming you have a component for the page content

export default function LaboratoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LaboratoriesPageContent />
    </Suspense>
  );
}
