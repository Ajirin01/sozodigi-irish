'use client';

import { fetchData } from '@/utils/api';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function ProductDetails() {
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetchData(`products/${id}`);
        if (!response) throw new Error('Product not found');
        setProduct(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay isLoading={isLoading} />}

      <div className={`pt-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Error or Not Found Handling */}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}
        {!product && !isLoading && <p className="text-gray-500 text-center">Product not found</p>}

        {/* Show content only if product is fetched and there's no error */}
        {product && (
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
                  <Link href="/pharmacy" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                    Products
                  </Link>
                </li>
                <li>/</li>
                <li className="text-sm text-gray-500">{product.name}</li>
              </ol>
            </nav>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8 pb-20">
              {/* Image Section */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 py-6 lg:px-6 sm:px-2">
                <div className="w-full max-w-md aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    alt={product.name || 'Product image'}
                    src={product.photo || '/images/placeholder.jpg'}
                    className="w-full h-full object-cover transition duration-200"
                  />
                </div>

              </div>

              {/* Product Details */}
              <div className="space-y-6 lg:py-12">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>
                <p className="text-3xl tracking-tight text-gray-900">
                  ₦{(Number(product.price) * quantity).toLocaleString()}
                </p>
                <p className="text-base text-gray-900">{product.description}</p>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mt-6">
                  <span className="text-sm font-medium text-gray-900">Quantity:</span>
                  <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2">
                    <button className="text-gray-600 hover:text-gray-900" onClick={decreaseQuantity}>
                      −
                    </button>
                    <span className="text-gray-900 text-lg">{quantity}</span>
                    <button className="text-gray-600 hover:text-gray-900" onClick={increaseQuantity}>
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <AddToCartButton product={product} quantity={quantity} productType={"Medication"} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
