"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/admin/ui/table";
import Badge from "@/components/admin/ui/badge/Badge";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";

const PrescriptionList = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status"); // Get status from URL

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColorMap = {
    approved: "success",
    pending: "warning",
    rejected: "error",
    declined: "error",
  };

  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    if (sessionStatus === "loading") return; // Wait for session to load
    if (!status || !token) {
      console.error("No authentication token available.");
      return;
    }
    fetchPrescriptions();
  }, [status, token, sessionStatus]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetchData(`cart/linked-prescriptions/by/status?status=${status}`, token);
      console.log("linked prescription", response)
      setPrescriptions(response || []); // Ensure we handle possible undefined response
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const customLoader = ({ src }) => {
    return src; // Allows external image URLs
  };

  const checkExpiry = (createdAt) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const differenceInTime = currentDate - createdDate;
    const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert to days
    return differenceInDays > 10 ? "Expired" : "Valid";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <h2 className="text-2xl font-bold mb-4 capitalize">{status} Linked Prescriptions</h2>
      {loading ? (
        <div className="flex justify-center">
          <h1>Loading...</h1>
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Linked At
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Expiry Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {prescriptions.map((prescription) => (
                  <TableRow key={prescription._id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="w-10 h-10 overflow-hidden rounded">
                        <Image
                          loader={customLoader}
                          width={40}
                          height={40}
                          src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${prescription.prescription?.fileUrl}` || "/images/default-product.jpg"}
                          alt={prescription._id}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {(prescription.user?.firstName + " " + prescription.user?.lastName) || "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="px-5 py-4 text-start" color={statusColorMap[status] || "light"} variant="light">
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge className="px-5 py-4 text-start" color={checkExpiry(prescription.prescription?.createdAt) === "Expired" ? "error" : "success"} variant="light">
                        {checkExpiry(prescription.prescription?.createdAt)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link href={`linked/${prescription.prescription?._id}/view?cartItemId=${prescription._id}`} target="_blank" className="text-blue-500">
                        <EyeIcon className="w-5 h-5 inline-block" />
                      </Link>
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
    </div>
  );
};

export default PrescriptionList;
