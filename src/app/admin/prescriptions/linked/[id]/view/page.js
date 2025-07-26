"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchData, updateData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";


const PrescriptionView = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [updating, setUpdating] = useState(false);

  const searchParams = useSearchParams();
  const highlightedCartItemId = searchParams.get("cartItemId");

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    if (!id || !token) return;
    fetchPrescription();

    if (highlightedCartItemId) {
      setExpandedItems((prev) => ({
        ...prev,
        [highlightedCartItemId]: true,
      }));
    }
  }, [id, token, highlightedCartItemId]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const data = await fetchData(`prescriptions/${id}`, token);
      console.log("prescription", data)
      setPrescription(data);
    } catch (err) {
      console.error("Failed to fetch prescription", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!statusUpdate || statusUpdate === status) return;
  
    try {
      setUpdating(true);
      const response = await updateData(`cart/update/linked-prescriptions`, {  cartItemId: highlightedCartItemId, status: statusUpdate }, token);
      console.log(response)
      await fetchPrescription(); // Refresh after update
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  const toggleItem = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const customLoader = ({ src }) => src;

  if (loading) return <div className="p-6">Loading...</div>;

  if (!prescription) return <div className="p-6 text-red-500">Prescription not found</div>;

  const { fileUrl, createdAt, user, associatedCartItems } = prescription;
  console.log("items",prescription.associatedCartItems)

  const highlightedCartItem = associatedCartItems?.find(
    (item) => item._id === highlightedCartItemId
  );

  const status = highlightedCartItem.prescriptionLinkStatus

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Prescription Details</h2>
  
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={statusUpdate || status}
            onChange={(e) => setStatusUpdate(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Rejected</option>
          </select>
  
          <button
            onClick={updateStatus}
            disabled={statusUpdate === status || updating}
            className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="mb-2"><strong>Status:</strong> {status}</p>
          <p className="mb-2"><strong>Uploaded At:</strong> {new Date(createdAt).toLocaleString()}</p>
          <p className="mb-2"><strong>User:</strong> {(user?.firstName +" "+ user?.lastName) || "N/A"}</p>
        </div>
        <div>
          <p className="font-medium mb-2">Prescription File:</p>
          <div className="w-full max-w-md rounded overflow-hidden border border-gray-300 dark:border-gray-700">
            <Image
              loader={customLoader}
              src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${fileUrl}`}
              alt="Prescription"
              width={600}
              height={400}
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="mt-2">
            <Link
              href={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${fileUrl}`}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Open in new tab
            </Link>
          </div>
        </div>
      </div>
  
      {associatedCartItems?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Associated Cart Items</h3>
          <div className="space-y-4">
            {associatedCartItems.map((item) => {
              const isHighlighted = item._id === highlightedCartItemId;

              return (
                <div
                  key={item._id}
                  className={`border rounded-lg p-4 ${
                    isHighlighted
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/10"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleItem(item._id)}
                >
                  <div>
                    <p className="font-medium">{item.product?.name || "Unknown Product"}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  {expandedItems[item._id] ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
  
                {expandedItems[item._id] && (
                  <div className="mt-4 border-t pt-3 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>ID:</strong> {item._id}</p>
                    <p><strong>Requires Prescription:</strong> {item.product?.prescriptionRequired ? "Yes" : "No"}</p>
                    <p><strong>Price:</strong> ₦{item.product?.price?.toLocaleString() || "N/A"}</p>
                    {item.product?.image && (
                      <div className="mt-2">
                        <Image
                          loader={customLoader}
                          src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${item.product.image}`}
                          alt={item.product.name}
                          width={100}
                          height={100}
                          className="rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionView;
