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

const LabServicesPage = () => {
  const [labServices, setLabServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  // Fetch lab services on component mount
  useEffect(() => {
    const loadLabServices = async () => {
      try {
        // API call to get lab services
        const data = await fetchData("/lab-services/get-all/no-pagination");
        setLabServices(data);
      } catch (error) {
        console.error("Error fetching lab services:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    loadLabServices();
  }, []);

  // Delete a lab service
  const deleteLabService = async () => {
    // if (!confirm("Are you sure you want to delete this lab service?")) return;

    try {
      // API call to delete the lab service
      await deleteData(`lab-services/${itemToDelete._id}`, token);
      // Update the state after deletion by filtering out the deleted service
      setLabServices(labServices.filter((service) => service._id !== itemToDelete._id));
      alertSuccess("Laboratory service successfully deleted")
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting lab service:", error);
      alertError("Failed to delete service!")
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      {/* Header Section */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Lab Service Management</h1>
        <Link
          href="/admin/laboratories/services/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          Add Lab Service
        </Link>
      </div>

      {/* Table Section */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {loading ? (
            <p>Loading lab services...</p>
          ) : (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Lab Service Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {labServices.map((labService) => (
                  <TableRow key={labService._id}>
                    {/* Lab Service Name */}
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {labService.name}
                    </TableCell>

                    {/* Actions (Edit & Delete) */}
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link href={`/admin/laboratories/services/edit/${labService._id}`} className="text-blue-500">
                        <PencilSquareIcon className="w-5 h-5 inline-block" />
                      </Link>
                      <button className="text-red-500" onClick={() => { setIsDialogOpen(true), setItemToDelete(labService)}}>
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
            onConfirm={deleteLabService}
            title="Delete Item"
            message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
            confirmText="Yes, Delete"
            cancelText="No, Keep"
        />
    </div>
  );
};

export default LabServicesPage;
