"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/admin/ui/table";
import Badge from "@/components/admin/ui/badge/Badge";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const PrescriptionList = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const statusColorMap = {
    approved: "success",
    pending: "warning",
    rejected: "error",
    declined: "error",
  };

  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!status || !token) return;

    fetchPrescriptions();
  }, [status, token, sessionStatus]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetchData(`prescriptions/by/status?status=${status}`, token);
      setPrescriptions(response || []);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      await deleteData(`prescriptions/delete/custom/${itemToDelete._id}`, token);
      setPrescriptions((prev) => prev.filter((p) => p._id !== itemToDelete._id));
    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert("Error rejecting prescription");
    } finally {
      setIsDialogOpen(false);
      setItemToDelete(null);
      setLoading(false);
    }
  };

  const checkExpiry = (createdAt) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const differenceInDays = (currentDate - createdDate) / (1000 * 3600 * 24);
    return differenceInDays > 10 ? "Expired" : "Valid";
  };

  const customLoader = ({ src }) => src;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <h2 className="text-2xl font-bold mb-4 capitalize">{status} Uploaded Prescriptions</h2>

      {loading ? (
        <div className="flex justify-center">
          <h1>Loading...</h1>
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {["ID", "User", "Uploaded At", "Status", "Expiry Status", "Actions"].map((header) => (
                    <TableCell key={header} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((prescription) => (
                  <TableRow key={prescription._id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="w-10 h-10 overflow-hidden rounded">
                        <Image
                          loader={customLoader}
                          width={40}
                          height={40}
                          src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${prescription.fileUrl}`}
                          alt={prescription._id}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">{prescription.user?.firstName} {prescription.user?.lastName}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500">{new Date(prescription.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className="px-5 py-4 text-start" color={statusColorMap[status] || "light"} variant="light">
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge color={checkExpiry(prescription.createdAt) === "Expired" ? "error" : "success"} variant="light">
                        {checkExpiry(prescription.createdAt)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start flex gap-3 items-center">
                      <Link href={`uploads/${prescription._id}/view`} target="_blank" className="text-blue-500">
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <button onClick={() => confirmDelete(prescription)} className="text-red-500" disabled={loading}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <p className="text-center">No prescriptions found.</p>
      )}

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Reject Prescription"
        message={`Are you sure you want to reject this prescription?`}
        confirmText="Yes, Reject"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PrescriptionList;
