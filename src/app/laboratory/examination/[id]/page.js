'use client';

import { fetchData } from '@/utils/api';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton'; // Assuming this is still relevant
import LoadingOverlay from '@/components/LoadingOverlay';

export default function ExaminationDetails() {
  const params = useParams();
  const { id } = params;

  const [examination, setExamination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamination = async () => {
      try {
        setIsLoading(true);
        const response = await fetchData(`lab-services/${id}`);
        if (!response) throw new Error('Examination not found');
        setExamination(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchExamination();
  }, [id]);

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay isLoading={isLoading} />}

      <div className={`pt-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Error or Not Found Handling */}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}
        {!examination && !isLoading && <p className="text-gray-500 text-center">Examination not found</p>}

        {/* Show content only if examination is fetched and there's no error */}
        {examination && (
          <>
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb">
              <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <li>
                  <Link href="/" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/lab-services" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                    Examinations
                  </Link>
                </li>
                <li>/</li>
                <li className="text-sm text-gray-500">{examination.name}</li>
              </ol>
            </nav>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8 pb-20">
              {/* Image Section */}
              <div className="w-full max-w-md aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                    alt={examination.name || 'Examination image'}
                    src={examination.photo || '/images/lab-test.jpg'}
                    className="w-full h-full object-cover transition duration-200"
                />
                </div>

              {/* Examination Details */}
              <div className="space-y-6 lg:py-12">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{examination.name}</h1>
                <p className="text-3xl tracking-tight text-gray-900">
                  ₦{(Number(examination.price)).toLocaleString()}
                </p>
                <p className="text-base text-gray-900">{examination.description}</p>

                {/* Add to Cart Button */}
                <AddToCartButton product={examination} quantity={1} productType={"LabService"} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
