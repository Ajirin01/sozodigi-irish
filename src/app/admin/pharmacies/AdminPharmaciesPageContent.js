"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import Badge from "@/components/admin/ui/badge/Badge";
import { fetchData } from "@/utils/api";

const PharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        const url = statusFilter
          ? `/pharmacies/get-all/no-pagination?status=${statusFilter}`
          : `/pharmacies/get-all/no-pagination`;
        const data = await fetchData(url);

        console.log(data)
        setPharmacies(data);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPharmacies();
  }, [statusFilter]);

  const deletePharmacy = async (id) => {
    if (confirm("Are you sure you want to delete this pharmacy?")) {
      console.log("Delete pharmacy with ID:", id);
      // Implement actual delete logic here
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Pharmacy Management</h1>
        <Link
            href="/admin/pharmacies/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
            Add Pharmacy
        </Link>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {loading ? (
            <p>Loading pharmacies...</p>
          ) : (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    License
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Contact
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {pharmacies.map((pharmacy) => (
                  <TableRow key={pharmacy._id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{pharmacy.name}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Link
                        href={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${pharmacy.license}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {pharmacy.license?.replace('/uploads/', '')}
                    </Link>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{pharmacy.contactNumber}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          pharmacy.status === "verified"
                            ? "success"
                            : pharmacy.status === "unverified"
                            ? "warning"
                            : "error"
                        }
                      >
                        {pharmacy.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link href={`/admin/pharmacies/edit/${pharmacy._id}`} className="text-blue-500">
                        <PencilSquareIcon className="w-5 h-5" />
                      </Link>
                      <button onClick={() => deletePharmacy(pharmacy._id)} className="text-red-500">
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
    </div>
  );
};

export default PharmaciesPage;
