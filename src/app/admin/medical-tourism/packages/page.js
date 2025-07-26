"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const MedicalTourPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await fetchData("/tour/get-all/no-pagination", token);
        console.log(data)
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  const deletePackage = async () => {
    try {
      await deleteData(`tour/${itemToDelete._id}`, token);
      setPackages(packages.filter((_package) => _package._id !== itemToDelete._id));
      alertSuccess("Medical tourism package successfully deleted");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting package:", error);
      alertError("Failed to delete package!");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      {/* Header Section */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Medical Tourism Packages</h1>
        <Link
          href="/admin/medical-tourism/packages/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          Add Package
        </Link>
      </div>

      {/* Table Section */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {loading ? (
            <p>Loading packages...</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Package Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Destination
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {packages.map((_package) => (
                  <TableRow key={_package._id}>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {_package.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(_package.price)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {_package.location}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link
                        href={`/admin/medical-tourism/packages/edit/${_package._id}`}
                        className="text-blue-500"
                      >
                        <PencilSquareIcon className="w-5 h-5 inline-block" />
                      </Link>
                      <button
                        className="text-red-500"
                        onClick={() => {
                          setIsDialogOpen(true);
                          setItemToDelete(_package);
                        }}
                      >
                        <TrashIcon className="w-5 h-5 inline-block" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={deletePackage}
        title="Delete Package"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Keep"
      />
    </div>
  );
};

export default MedicalTourPackagesPage;
