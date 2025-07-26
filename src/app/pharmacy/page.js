import { Suspense } from 'react';
import PharmacyPage from './PharmacyPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PharmacyPage />
    </Suspense>
  );
}
