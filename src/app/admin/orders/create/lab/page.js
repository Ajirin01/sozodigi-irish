"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { TrashIcon } from "@heroicons/react/24/outline";

const LabOrderPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const [labServices, setLabServices] = useState([]);
  const [basket, setBasket] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  const selectedUser = typeof window !== "undefined" ? sessionStorage.getItem("newOrderUser") : null;
  const userId = selectedUser;

  const loadLabServices = async (query = "") => {
    setLoading(true);
    try {
      const data = await fetchData(`lab-services?page=${page}&search=${query}`, token);
      setLabServices(data.data);
      setTotalPages(data.pages);
      setNoResults(data.data.length === 0);
    } catch (err) {
      addToast("Failed to load lab services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUser) {
      addToast("No user selected. Please select a user to place the order.", "error");
      router.push("/admin/orders/start");
    }
  }, [router, selectedUser]);

  useEffect(() => {
    if (!token || !userId) return;
    loadLabServices();
  }, [token, userId, page]);

  const handleSearch = () => {
    if (!token || !userId || !searchQuery.trim()) return;
    loadLabServices(searchQuery);
  };

  const handleLoadAll = () => {
    setSearchQuery("");
    loadLabServices();
  };

  const addToBasket = (service) => {
    const exists = basket.find((item) => item._id === service._id);
    if (exists) {
      addToast(`${service.name} is already in the basket`, "info");
    } else {
      setBasket((prev) => [...prev, service]);
      addToast(`${service.name} added to basket`, "success");
    }
  };

  const removeFromBasket = (serviceId) => {
    const updated = basket.filter((item) => item._id !== serviceId);
    const removed = basket.find((item) => item._id === serviceId);
    setBasket(updated);
    addToast(`${removed?.name} removed from basket`, "warning");
  };

  const handleCheckout = () => {
    if (basket.length === 0) {
      addToast("Add at least one lab service", "error");
      return;
    }

    sessionStorage.setItem("newLabOrderBasket", JSON.stringify(basket));
    router.push("/admin/orders/create/review");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Add Lab Services</h2>

      {/* Search Bar */}
      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Search for lab services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Search
        </button>
        <button
          onClick={handleLoadAll}
          className="px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          All
        </button>
      </div>

      {noResults && !loading && searchQuery.trim() && (
        <p className="text-gray-500">No services found for "{searchQuery}"</p>
      )}

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-4 lg:gap-6">
        {/* Lab Service List */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {labServices.map((service) => (
                  <div
                    key={service._id}
                    className="border p-4 rounded shadow hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {service.description}
                      </p>
                      <p className="text-gray-900 font-semibold dark:bg-gray-900 dark:text-gray-300">
                        ${service.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      className="mt-auto text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-700 hover:text-white hover:border-indigo-700 transition-all duration-300 ease-in-out px-4 py-2 rounded-full shadow-md hover:shadow-lg focus:outline-none"
                      onClick={() => addToBasket(service)}
                    >
                      Add to Basket
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center">
                <button
                  className="bg-orange-500 px-4 py-2 rounded disabled:opacity-50 text-sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-gray-600 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="bg-orange-500 px-4 py-2 rounded disabled:opacity-50 text-sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Basket */}
        <div className="border p-4 rounded shadow mb-6 lg:mb-0 h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Basket</h3>
          {basket.length === 0 ? (
            <p className="text-sm text-gray-500">No services added yet</p>
          ) : (
            <ul className="space-y-3">
              {basket.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromBasket(item._id)}>
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {basket.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm font-medium text-gray-900">
                <span>Total</span>
                <span>${basket.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
              </div>
              <button
                className="bg-indigo-700 text-white px-4 py-2 text-sm rounded w-full mt-2"
                onClick={handleCheckout}
              >
                Proceed to Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabOrderPage;
