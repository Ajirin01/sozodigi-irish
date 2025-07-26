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
import Badge from "@/components/admin/ui/badge/Badge";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { Verified } from "lucide-react";

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const loadHospitals = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchData(`/hospitals?page=${pageNum}&limit=5`);
      setHospitals(res.data);
      setPage(res.page);
      setPages(res.pages);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const deleteHospital = async (hospitalId) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;

    try {
      await deleteData(`/hospitals/${hospitalId}`, token);
      loadHospitals(page);
    } catch (error) {
      console.error("Error deleting hospital:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Hospital Management</h1>
        <Link
          href="/admin/hospitals/add"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Hospital
        </Link>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {loading ? (
            <p>Loading hospitals...</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500 dark:text-gray-400">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500 dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {hospitals.map((hospital) => (
                  <TableRow key={hospital._id}>
                    <TableCell className="px-5 py-4">{hospital.name}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        color={hospital.isVerified ? "success" : "error"}
                      >
                        {hospital.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 flex gap-3">
                      <Link
                        href={`/admin/hospitals/edit/${hospital._id}`}
                        className="text-blue-500"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </Link>
                      <button
                        className="text-red-500"
                        onClick={() => deleteHospital(hospital._id)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => loadHospitals(page - 1)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => loadHospitals(page + 1)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HospitalsPage;
