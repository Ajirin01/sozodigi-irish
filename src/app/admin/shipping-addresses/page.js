"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import {
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const ShippingAddressPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await fetchData(`shipping-addresses/custom/get?page=${page}`, token);
      setAddresses(data.data);
      setTotalPages(data.pages);
      setNoResults(data.data.length === 0);
    } catch (err) {
      addToast("Failed to load shipping addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadAddresses();
  }, [token, page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const deleteAddress = async () => {
    try {
      await deleteData(`shipping-addresses/${itemToDelete._id}`, token);
      setAddresses(addresses.filter((a) => a._id !== itemToDelete._id));
      addToast("Address deleted successfully", "success");
      setIsDialogOpen(false);
    } catch (err) {
      addToast("Failed to delete address", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold">Shipping Addresses</h2>
        <Link
          href="/admin/shipping-addresses/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          Create Address
        </Link>
      </div>

      {noResults && !loading && searchQuery.trim() && (
        <p className="text-gray-500">No shipping addresses found for "{searchQuery}"</p>
      )}

      <div className="space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <ul className="space-y-4">
            {addresses.map((address) => (
              <li
                key={address._id}
                className="border p-4 rounded shadow relative"
              >
                <div className="mb-2">
                  <h3 className="font-semibold">{address.address.name}</h3>
                  <p className="text-sm text-gray-500">{address.address.line1}</p>
                  <p className="text-sm text-gray-500">
                    {address.address.city}, {address.address.state}, {address.address.zip}
                  </p>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Belongs to: <span className="text-indigo-600">
                    {address.user?.firstName + " " + address.user?.lastName ||
                      address.user?.email ||
                      "Unknown User"}
                  </span>
                </p>
                <div className="absolute top-4 right-4 flex gap-3">
                  <Link
                    href={`/admin/shipping-addresses/edit/${address._id}`}
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
                  </Link>
                  <button
                    title="Delete"
                    onClick={() => {
                      setItemToDelete(address);
                      setIsDialogOpen(true);
                    }}
                  >
                    <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            className="bg-orange-500 px-4 py-2 rounded disabled:opacity-50 text-sm"
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-600 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            className="bg-orange-500 px-4 py-2 rounded disabled:opacity-50 text-sm"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={deleteAddress}
        title="Delete Address"
        message={`Are you sure you want to delete this address? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ShippingAddressPage;
