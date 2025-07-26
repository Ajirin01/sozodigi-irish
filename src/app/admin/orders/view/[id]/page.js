"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import {
  ArrowPathIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [selectedStore, setSelectedStore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openStoreModal = (item) => {
    const isMedication = order.category === "Medication";
    const isLab = order.category === "LabService";
  
    const storeOrLab = isMedication ? item.product.pharmacy : isLab ? item.labService.laboratory : null;
    const source = isMedication ? "Pharmacy" : isLab ? "Laboratory" : "Unknown";
  
    if (storeOrLab) {
      setSelectedStore({ ...storeOrLab, source });
      setIsModalOpen(true);
    } else {
      console.warn("No store or lab info available for this item.");
    }
  };
  

  const closeStoreModal = () => {
    setIsModalOpen(false);
    setSelectedStore(null);
  };

  useEffect(() => {
    if (!token || !id) return;
    const getOrder = async () => {
      try {
        const data = await fetchData(`orders/custom/${id}`, token);
        console.log(data.order)
        setOrder(data.order);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrder();
  }, [token, id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-5 h-5 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading order...</span>
      </div>
    );

  if (!order)
    return (
      <div className="text-center py-10 text-red-500 font-medium">
        Order not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          Order #{order._id.slice(-6).toUpperCase()}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Placed by {order.placedBy?.firstName} {order.placedBy?.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-100">
            User Info
          </h4>
          <p>
            <span className="font-medium">Name:</span> {order.user?.firstName}{" "}
            {order.user?.lastName}
          </p>
          <p>
            <span className="font-medium">Email:</span> {order.user?.email}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-100">
            Order Info
          </h4>
          <p>
            <span className="font-medium">Status:</span> {order.status}
          </p>
          <p>
            <span className="font-medium">Payment:</span>{" "}
            {order.paymentStatus}
          </p>
          <p>
            <span className="font-medium">Category:</span> {order.category}
          </p>
          <p>
            <span className="font-medium">Total:</span> $
            {order.totalAmount?.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-100">
          Order Items
        </h4>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {order.items.map((item, index) => (
            <li
              key={index}
              className="py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {item.product?.name || "Product"}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  ${item.price.toFixed(2)}
                </p>
                <button
                  onClick={() => openStoreModal(item)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="View store/lab info"
                >
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

        {isModalOpen && selectedStore && (
            <div
                className="fixed inset-0 z-999999 flex items-center justify-center"
                role="dialog"
                aria-modal="true"
                onClick={closeStoreModal}
            >
                {/* Gray overlay */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                {/* Modal content */}
                <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-50 bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
                >
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {selectedStore.source} Info
                    </h3>
                    <button
                    onClick={closeStoreModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                    ✕
                    </button>
                </div>
                <div className="text-gray-700 dark:text-gray-200 space-y-2">
                    <p>
                    <span className="font-medium">Name:</span> {selectedStore.name}
                    </p>
                    <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedStore.contactEmail || "N/A"}
                    </p>
                    <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedStore.contactNumber || "N/A"}
                    </p>
                    <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedStore.address
                            ? `${selectedStore.address.street}, ${selectedStore.address.city}, ${selectedStore.address.state}, ${selectedStore.address.country}`
                            : "N/A"}
                    </p>

                    {/* Add more fields if needed */}
                </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default OrderDetailsPage;
