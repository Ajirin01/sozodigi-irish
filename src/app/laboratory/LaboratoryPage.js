"use client";

import { fetchData } from "@/utils/api";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay"; // Import the LoadingOverlay component

export default function LabReferral() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: initialPage, pages: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices(initialPage);
  }, [initialPage]);

  async function fetchServices(page) {
    setLoading(true);

    try {
      const response = await fetchData(`lab-services?page=${page}`);

      if (response && Array.isArray(response.data)) {
        setServices(response.data);
        setPagination({ total: response.total, page: response.page, pages: response.pages });
        router.push(`?page=${page}`, { scroll: false });
      } else {
        console.error("Invalid API response:", response);
      }
    } catch (error) {
      console.error("Error fetching lab services:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 min-h-screen relative">
      {/* Loading Overlay */}
      {loading && <LoadingOverlay isLoading={loading} />}

      <div className={`${loading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
            Medical Lab Services
          </h2>

          {loading ? (
            <p className="text-center text-gray-500 mt-6">Loading...</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service) => (
                <Link key={service._id} href={`/laboratory/examination/${service._id}`} className="group relative bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                  {/* Service Image */}
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-lg">
                    <img
                      alt={service.name}
                      src={service.photo || "/images/lab-test.jpg"} // Fallback image if no photo is available
                      className="object-cover w-full h-full group-hover:opacity-75"
                    />
                  </div>
                  {/* Service Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-xl font-bold text-indigo-600">
                        ₦{new Intl.NumberFormat().format(Math.round(service.price))}
                      </p>
                      <button className="text-sm text-blue-500 hover:text-blue-700">View Details</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => fetchServices(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className={`px-4 py-2 rounded-md ${pagination.page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchServices(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || loading}
                className={`px-4 py-2 rounded-md ${pagination.page === pagination.pages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
